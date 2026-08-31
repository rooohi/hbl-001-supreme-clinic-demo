const RAZORPAY_API_ORIGIN = "https://api.razorpay.com/v1";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_SIGNATURE_PAYLOAD_BYTES = 2_000_000;

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export type RazorpayConfigurationHealth = {
  provider: "razorpay";
  configured: boolean;
  status: "CONFIGURED_NOT_VERIFIED" | "NOT_CONFIGURED";
  operational: "NOT_CHECKED";
  networkChecked: false;
  mode: "LIVE" | "TEST" | "UNKNOWN";
  missingOrInvalid: string[];
};

export type CreateRazorpayOrderInput = {
  amountPaise: number;
  receipt: string;
  currency?: "INR";
  notes?: Record<string, string>;
};

export type RazorpayOrder = {
  id: string;
  amountPaise: number;
  amountPaidPaise: number;
  amountDuePaise: number;
  currency: string;
  receipt: string;
  status: string;
  createdAtSeconds: number;
};

export class RazorpayConfigurationError extends Error {
  readonly code = "RAZORPAY_NOT_CONFIGURED";

  constructor() {
    super("Razorpay is not configured for this environment.");
    this.name = "RazorpayConfigurationError";
  }
}

export class RazorpayRequestError extends Error {
  readonly code = "RAZORPAY_REQUEST_FAILED";
  readonly status: number;

  constructor(status: number) {
    super(`Razorpay rejected the request with HTTP ${status}.`);
    this.name = "RazorpayRequestError";
    this.status = status;
  }
}

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function isSecret(value: string, minimumLength: number) {
  return value.length >= minimumLength && !/^(replace|change[-_ ]?me|example|todo)/i.test(value);
}

function inspectConfiguration() {
  const keyId = clean(process.env.RAZORPAY_KEY_ID);
  const keySecret = clean(process.env.RAZORPAY_KEY_SECRET);
  const webhookSecret = clean(process.env.RAZORPAY_WEBHOOK_SECRET);
  const missingOrInvalid: string[] = [];

  if (!/^rzp_(?:live|test)_[A-Za-z0-9]+$/.test(keyId)) missingOrInvalid.push("RAZORPAY_KEY_ID");
  if (!isSecret(keySecret, 12)) missingOrInvalid.push("RAZORPAY_KEY_SECRET");
  if (!isSecret(webhookSecret, 16)) missingOrInvalid.push("RAZORPAY_WEBHOOK_SECRET");

  return {
    config: { keyId, keySecret, webhookSecret },
    missingOrInvalid,
    mode: keyId.startsWith("rzp_live_") ? "LIVE" as const : keyId.startsWith("rzp_test_") ? "TEST" as const : "UNKNOWN" as const,
  };
}

function requireConfiguration(): RazorpayConfig {
  const inspected = inspectConfiguration();
  if (inspected.missingOrInvalid.length) throw new RazorpayConfigurationError();
  return inspected.config;
}

export function getRazorpayConfigurationHealth(): RazorpayConfigurationHealth {
  const { missingOrInvalid, mode } = inspectConfiguration();
  const configured = missingOrInvalid.length === 0;
  return {
    provider: "razorpay",
    configured,
    status: configured ? "CONFIGURED_NOT_VERIFIED" : "NOT_CONFIGURED",
    operational: "NOT_CHECKED",
    networkChecked: false,
    mode,
    missingOrInvalid,
  };
}

function validateOrderInput(input: CreateRazorpayOrderInput) {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0 || input.amountPaise > 100_000_000) {
    throw new TypeError("Razorpay order amount must be a positive integer in paise.");
  }
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(input.receipt)) throw new TypeError("Invalid Razorpay receipt.");
  const entries = Object.entries(input.notes ?? {});
  if (entries.length > 15 || entries.some(([key, value]) => key.length > 64 || value.length > 256)) {
    throw new TypeError("Invalid Razorpay order notes.");
  }
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<RazorpayOrder> {
  const config = requireConfiguration();
  validateOrderInput(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${RAZORPAY_API_ORIGIN}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${config.keyId}:${config.keySecret}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency ?? "INR",
        receipt: input.receipt,
        notes: input.notes ?? {},
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new RazorpayRequestError(response.status);
    const payload: unknown = await response.json();
    const order = readOrder(payload);
    if (!order) throw new RazorpayRequestError(502);
    return order;
  } finally {
    clearTimeout(timeout);
  }
}

export async function verifyRazorpaySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!isSecret(secret, 12) || payload.length === 0 || new TextEncoder().encode(payload).byteLength > MAX_SIGNATURE_PAYLOAD_BYTES) {
    return false;
  }
  if (!/^[A-Fa-f0-9]{64}$/.test(signature)) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}

export async function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<boolean> {
  const secret = clean(process.env.RAZORPAY_KEY_SECRET);
  if (!isProviderId(input.orderId, "order_") || !isProviderId(input.paymentId, "pay_")) return false;
  return verifyRazorpaySignature(`${input.orderId}|${input.paymentId}`, input.signature, secret);
}

export async function verifyRazorpayWebhookSignature(rawBody: string, signature: string): Promise<boolean> {
  const webhookSecret = clean(process.env.RAZORPAY_WEBHOOK_SECRET);
  return verifyRazorpaySignature(rawBody, signature, webhookSecret);
}

function isProviderId(value: string, prefix: string) {
  return value.startsWith(prefix) && value.length > prefix.length && value.length <= 128 && /^[A-Za-z0-9_]+$/.test(value);
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < hex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
  }
  return bytes;
}

function readOrder(payload: unknown): RazorpayOrder | null {
  if (!payload || typeof payload !== "object") return null;
  const id = Reflect.get(payload, "id");
  const amount = Reflect.get(payload, "amount");
  const amountPaid = Reflect.get(payload, "amount_paid");
  const amountDue = Reflect.get(payload, "amount_due");
  const currency = Reflect.get(payload, "currency");
  const receipt = Reflect.get(payload, "receipt");
  const status = Reflect.get(payload, "status");
  const createdAt = Reflect.get(payload, "created_at");

  if (
    typeof id !== "string" || !isProviderId(id, "order_") ||
    !Number.isSafeInteger(amount) || !Number.isSafeInteger(amountPaid) || !Number.isSafeInteger(amountDue) ||
    typeof currency !== "string" || typeof receipt !== "string" ||
    typeof status !== "string" || !Number.isSafeInteger(createdAt)
  ) return null;

  return {
    id,
    amountPaise: amount as number,
    amountPaidPaise: amountPaid as number,
    amountDuePaise: amountDue as number,
    currency,
    receipt,
    status,
    createdAtSeconds: createdAt as number,
  };
}
