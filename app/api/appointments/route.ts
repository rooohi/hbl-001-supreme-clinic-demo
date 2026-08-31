import { getD1 } from "@/db";
import { indiaDayBounds, localDateInIndia, requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { createAppointment } from "@/server/scheduling";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const date = new URL(request.url).searchParams.get("date") ?? localDateInIndia();
    const { start, end } = indiaDayBounds(date);
    const result = await getD1().prepare(`
      SELECT a.id, a.status, a.appointment_type AS type, a.booking_source AS source,
        a.service_name_snapshot AS serviceName, a.duration_minutes_snapshot AS durationMinutes,
        a.scheduled_at_ms AS scheduledAt, a.reason, a.notes, a.row_version AS rowVersion,
        p.id AS patientId, p.display_name AS patientName, p.patient_number AS patientNumber,
        p.phone_last4 AS phoneLast4
      FROM appointments a
      JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
      WHERE a.tenant_id = ? AND a.location_id = ? AND a.scheduled_at_ms >= ? AND a.scheduled_at_ms < ?
      ORDER BY a.scheduled_at_ms
    `).bind(actor.tenantId, actor.locationId, start, end).all();
    return Response.json({ appointments: result.results, date });
  } catch (error) {
    return jsonError(error, "Unable to load appointments");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.write");
    const body = await request.json();
    const appointment = await createAppointment(body, {
      actorType: "STAFF",
      actorId: actor.staffId,
      idempotencyKey: request.headers.get("idempotency-key") ?? requestId(request),
    });
    return Response.json({ appointment }, { status: appointment.replayed ? 200 : 201 });
  } catch (error) {
    return jsonError(error, "Unable to create appointment");
  }
}
