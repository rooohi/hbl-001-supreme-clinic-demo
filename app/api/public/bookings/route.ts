import { jsonError, requestId } from "@/server/http";
import { createAppointment } from "@/server/scheduling";
import { checkPublicRateLimit, createBookingStatusCapability } from "@/server/patient-access";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await checkPublicRateLimit(request, "public-booking-create", 8);
    const body = await request.json() as Record<string, unknown>;
    const appointment = await createAppointment(body, {
      actorType: "PATIENT",
      idempotencyKey: request.headers.get("idempotency-key") ?? requestId(request),
    });
    const capability = await createBookingStatusCapability(appointment.id);
    return Response.json({
      appointment: { ...appointment, trackingToken: capability.token, trackingExpiresAt: capability.expiresAt },
      message: "Your appointment is confirmed.",
      communication: { status: "not-sent", reason: "WhatsApp/SMS provider is not configured" },
    }, { status: appointment.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to book appointment");
  }
}
