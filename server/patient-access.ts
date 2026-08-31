import { getD1 } from "@/db";
import { TWACHA_TENANT_ID } from "./clinic-context";

function base64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createBookingStatusCapability(appointmentId: string) {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = base64Url(bytes);
  const tokenHash = await sha256Hex(token);
  const now = Date.now();
  const expiresAt = now + 30 * 86_400_000;
  await getD1().prepare(`
    INSERT INTO patient_access_tokens (tenant_id,id,appointment_id,purpose,token_hash,expires_at_ms,created_at_ms,updated_at_ms)
    VALUES (?,?,?,'BOOKING_STATUS',?,?,?,?)
  `).bind(TWACHA_TENANT_ID, crypto.randomUUID(), appointmentId, tokenHash, expiresAt, now, now).run();
  return { token, expiresAt };
}

export async function checkPublicRateLimit(request: Request, routeKey: string, limit: number, windowMs = 15 * 60_000) {
  const address = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "local-preview";
  const salt = process.env.AUTH_SECRET || "twacha-public-rate-limit";
  const keyHash = await sha256Hex(`${salt}:${address}`);
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const d1 = getD1();
  await d1.prepare(`
    INSERT INTO public_rate_limits (key_hash,route_key,window_start_ms,request_count,updated_at_ms)
    VALUES (?,?,?,1,?)
    ON CONFLICT(key_hash,route_key,window_start_ms) DO UPDATE SET
      request_count = public_rate_limits.request_count + 1,
      updated_at_ms = excluded.updated_at_ms
  `).bind(keyHash, routeKey, windowStart, now).run();
  const row = await d1.prepare(`
    SELECT request_count AS requestCount FROM public_rate_limits
    WHERE key_hash = ? AND route_key = ? AND window_start_ms = ? LIMIT 1
  `).bind(keyHash, routeKey, windowStart).first<{ requestCount: number }>();
  if ((row?.requestCount ?? 1) > limit) {
    const retryAfter = Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
    throw Response.json({ error: "Too many requests. Please wait and try again.", code: "RATE_LIMITED" }, {
      status: 429,
      headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" },
    });
  }
}
