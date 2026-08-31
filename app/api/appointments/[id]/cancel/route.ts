import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "appointments.cancel");
    const { id } = await params;
    const input = z.object({ reason: z.string().trim().min(2).max(300), rowVersion: z.number().int().positive() }).parse(await request.json());
    const d1 = getD1();
    const appointment = await d1.prepare("SELECT reservation_id AS reservationId,location_id AS locationId,status,row_version AS rowVersion FROM appointments WHERE tenant_id = ? AND id = ? LIMIT 1")
      .bind(actor.tenantId, id).first<{ reservationId: string; locationId: string; status: string; rowVersion: number }>();
    if (!appointment) return Response.json({ error: "Appointment not found" }, { status: 404 });
    if (appointment.locationId !== actor.locationId) return Response.json({ error: "This appointment belongs to another clinic location." }, { status: 403 });
    if (appointment.rowVersion !== input.rowVersion) return Response.json({ error: "The appointment changed. Refresh and try again." }, { status: 409 });
    if (!["SCHEDULED", "CONFIRMED", "ARRIVED"].includes(appointment.status)) return Response.json({ error: "This appointment can no longer be cancelled." }, { status: 409 });
    const now = Date.now();
    await d1.batch([
      d1.prepare("UPDATE appointments SET status = 'CANCELLED', notes = ?, cancelled_at_ms = ?, row_version = row_version + 1, updated_at_ms = ? WHERE tenant_id = ? AND id = ? AND status = ? AND row_version = ?")
        .bind(input.reason, now, now, actor.tenantId, id, appointment.status, input.rowVersion),
      d1.prepare(`
        UPDATE schedule_reservations SET state = 'RELEASED', reason = ?, row_version = row_version + 1, updated_at_ms = ?
        WHERE tenant_id = ? AND id = ?
          AND EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'CANCELLED'
              AND a.row_version = ? AND a.updated_at_ms = ? AND a.notes = ?
          )
      `).bind(
        input.reason, now, actor.tenantId, appointment.reservationId,
        actor.tenantId, id, input.rowVersion + 1, now, input.reason,
      ),
      d1.prepare(`
        DELETE FROM provider_slot_claims
        WHERE tenant_id = ? AND reservation_id = ?
          AND EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'CANCELLED'
              AND a.row_version = ? AND a.updated_at_ms = ? AND a.notes = ?
          )
      `).bind(actor.tenantId, appointment.reservationId, actor.tenantId, id, input.rowVersion + 1, now, input.reason),
      d1.prepare(`
        INSERT INTO appointment_events (tenant_id,id,appointment_id,event_type,from_status,to_status,actor_type,actor_id,metadata_json,occurred_at_ms)
        SELECT ?,?,?, 'appointment.cancelled', ?, 'CANCELLED', 'STAFF', ?, ?, ?
        WHERE EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'CANCELLED'
            AND a.row_version = ? AND a.updated_at_ms = ? AND a.notes = ?
        )
      `).bind(
        actor.tenantId, crypto.randomUUID(), id, appointment.status, actor.staffId,
        JSON.stringify({ reason: input.reason }), now,
        actor.tenantId, id, input.rowVersion + 1, now, input.reason,
      ),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        SELECT ?,?,'STAFF',?,'appointment.cancel','appointment',?,'SUCCESS',?,?,?
        WHERE EXISTS (
          SELECT 1 FROM appointments a
          WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'CANCELLED'
            AND a.row_version = ? AND a.updated_at_ms = ? AND a.notes = ?
        )
      `).bind(
        actor.tenantId, crypto.randomUUID(), actor.staffId, id, requestId(request), "{}", now,
        actor.tenantId, id, input.rowVersion + 1, now, input.reason,
      ),
    ]);
    const committed = await d1.prepare(
      "SELECT status,row_version AS rowVersion,updated_at_ms AS updatedAt,notes FROM appointments WHERE tenant_id = ? AND id = ? LIMIT 1",
    ).bind(actor.tenantId, id).first<{ status: string; rowVersion: number; updatedAt: number; notes: string | null }>();
    if (!committed || committed.status !== "CANCELLED" || committed.rowVersion !== input.rowVersion + 1 || committed.updatedAt !== now || committed.notes !== input.reason) {
      return Response.json({ error: "The appointment changed while cancellation was being saved. Refresh and try again.", code: "VERSION_CONFLICT" }, { status: 409 });
    }
    return Response.json({ id, status: "CANCELLED", recoveryOpportunity: { status: "not_implemented" } });
  } catch (error) {
    return jsonError(error, "Unable to cancel appointment");
  }
}
