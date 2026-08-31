import { ZodError } from "zod";

export function jsonError(error: unknown, fallback = "Unable to complete the request") {
  if (error instanceof Response) return error;

  if (error instanceof ZodError) {
    return Response.json({
      error: "Check the highlighted information and try again.",
      code: "VALIDATION_FAILED",
      fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : fallback;
  const lower = message.toLowerCase();
  if (lower.includes("unique constraint") || lower.includes("provider_slot_claims")) {
    return Response.json({ error: "That time was just taken. Choose another available slot.", code: "SLOT_CONFLICT" }, { status: 409 });
  }
  if (lower.includes("no such table") || lower.includes("d1 binding")) {
    return Response.json({ error: "Clinic data is not initialized yet.", code: "DATA_NOT_READY" }, { status: 503 });
  }
  const inputError = [
    "consent is required", "valid mobile number", "future appointment", "180 days",
    "closed on sundays", "available 20-minute", "within clinic hours", "service is unavailable",
  ].some((fragment) => lower.includes(fragment));
  if (inputError) return Response.json({ error: message, code: "INVALID_REQUEST" }, { status: 400 });

  console.error("Twacha request failed", { error: error instanceof Error ? error.name : "UnknownError" });
  return Response.json({ error: fallback, code: "REQUEST_FAILED" }, { status: 500 });
}

export function requestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}
