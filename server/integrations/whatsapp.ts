const WHATSAPP_API_ORIGIN = "https://graph.facebook.com";
const REQUEST_TIMEOUT_MS = 10_000;

type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  graphApiVersion: string;
};

export type WhatsAppConfigurationHealth = {
  provider: "meta_whatsapp_cloud_api";
  configured: boolean;
  status: "CONFIGURED_NOT_VERIFIED" | "NOT_CONFIGURED";
  operational: "NOT_CHECKED";
  networkChecked: false;
  missingOrInvalid: string[];
};

export type WhatsAppTemplateComponent = {
  type: "header" | "body" | "button";
  parameters: Array<Record<string, unknown>>;
  sub_type?: "quick_reply" | "url";
  index?: string;
};

export type SendWhatsAppTemplateInput = {
  to: string;
  templateName: string;
  languageCode: string;
  components?: WhatsAppTemplateComponent[];
};

export type WhatsAppSendReceipt = {
  provider: "meta_whatsapp_cloud_api";
  providerMessageId: string;
};

export class WhatsAppConfigurationError extends Error {
  readonly code = "WHATSAPP_NOT_CONFIGURED";

  constructor() {
    super("WhatsApp is not configured for this environment.");
    this.name = "WhatsAppConfigurationError";
  }
}

export class WhatsAppRequestError extends Error {
  readonly code = "WHATSAPP_REQUEST_FAILED";
  readonly status: number;

  constructor(status: number) {
    super(`WhatsApp rejected the request with HTTP ${status}.`);
    this.name = "WhatsAppRequestError";
    this.status = status;
  }
}

function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

function isCredential(value: string, minimumLength: number) {
  return value.length >= minimumLength && !/^(replace|change[-_ ]?me|example|todo)/i.test(value);
}

function inspectConfiguration() {
  const accessToken = clean(process.env.WHATSAPP_PROVIDER_TOKEN);
  const phoneNumberId = clean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const graphApiVersion = clean(process.env.WHATSAPP_GRAPH_API_VERSION);
  const missingOrInvalid: string[] = [];

  if (!isCredential(accessToken, 20)) missingOrInvalid.push("WHATSAPP_PROVIDER_TOKEN");
  if (!/^\d{5,30}$/.test(phoneNumberId)) missingOrInvalid.push("WHATSAPP_PHONE_NUMBER_ID");
  if (!/^v\d{2,3}\.\d+$/.test(graphApiVersion)) missingOrInvalid.push("WHATSAPP_GRAPH_API_VERSION");

  return {
    config: { accessToken, phoneNumberId, graphApiVersion },
    missingOrInvalid,
  };
}

function requireConfiguration(): WhatsAppConfig {
  const inspected = inspectConfiguration();
  if (inspected.missingOrInvalid.length) throw new WhatsAppConfigurationError();
  return inspected.config;
}

export function getWhatsAppConfigurationHealth(): WhatsAppConfigurationHealth {
  const { missingOrInvalid } = inspectConfiguration();
  const configured = missingOrInvalid.length === 0;
  return {
    provider: "meta_whatsapp_cloud_api",
    configured,
    status: configured ? "CONFIGURED_NOT_VERIFIED" : "NOT_CONFIGURED",
    operational: "NOT_CHECKED",
    networkChecked: false,
    missingOrInvalid,
  };
}

function validateTemplateInput(input: SendWhatsAppTemplateInput) {
  const to = input.to.replace(/^\+/, "");
  if (!/^\d{8,15}$/.test(to)) throw new TypeError("WhatsApp recipient must be an E.164 number.");
  if (!/^[a-z0-9_]{1,512}$/.test(input.templateName)) throw new TypeError("Invalid WhatsApp template name.");
  if (!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(input.languageCode)) throw new TypeError("Invalid WhatsApp language code.");
  if ((input.components?.length ?? 0) > 20) throw new TypeError("Too many WhatsApp template components.");
  return { ...input, to };
}

export async function sendWhatsAppTemplate(input: SendWhatsAppTemplateInput): Promise<WhatsAppSendReceipt> {
  const config = requireConfiguration();
  const validated = validateTemplateInput(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${WHATSAPP_API_ORIGIN}/${config.graphApiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: validated.to,
          type: "template",
          template: {
            name: validated.templateName,
            language: { code: validated.languageCode },
            ...(validated.components?.length ? { components: validated.components } : {}),
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) throw new WhatsAppRequestError(response.status);
    const payload: unknown = await response.json();
    const messageId = readProviderMessageId(payload);
    if (!messageId) throw new WhatsAppRequestError(502);
    return { provider: "meta_whatsapp_cloud_api", providerMessageId: messageId };
  } finally {
    clearTimeout(timeout);
  }
}

function readProviderMessageId(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const messages = Reflect.get(payload, "messages");
  if (!Array.isArray(messages) || !messages[0] || typeof messages[0] !== "object") return null;
  const id = Reflect.get(messages[0], "id");
  return typeof id === "string" && id.length > 0 && id.length <= 256 ? id : null;
}
