import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "followups.manage");
    const result = await getD1().prepare(`
      SELECT f.id, f.status, f.interval_code AS intervalCode, f.due_local_date AS dueDate,
        f.note, f.booked_appointment_id AS bookedAppointmentId,
        p.display_name AS patientName, p.patient_number AS patientNumber,
        p.phone_last4 AS phoneLast4, p.phone_e164 AS phone,
        source.service_id AS serviceId
      FROM follow_ups f
      JOIN patients p ON p.tenant_id = f.tenant_id AND p.id = f.patient_id
      LEFT JOIN appointments source ON source.tenant_id = f.tenant_id AND source.id = f.source_appointment_id
      WHERE f.tenant_id = ?
      ORDER BY CASE f.status WHEN 'OVERDUE' THEN 0 WHEN 'DUE' THEN 1 WHEN 'UPCOMING' THEN 2 ELSE 3 END,
        f.due_local_date ASC LIMIT 100
    `).bind(actor.tenantId).all();
    return Response.json({ followUps: result.results });
  } catch (error) {
    return jsonError(error, "Unable to load follow-ups");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "followups.manage");
    const input = z.object({
      id: z.string().uuid(),
      action: z.enum(["COMPLETE", "DISMISS", "MARK_DUE", "BOOK"]),
      appointmentId: z.string().uuid().optional(),
    }).parse(await request.json());
    const status = { COMPLETE: "COMPLETED", DISMISS: "DISMISSED", MARK_DUE: "DUE", BOOK: "BOOKED" }[input.action];
    const now = Date.now();
    const d1 = getD1();

    if (input.action === "BOOK") {
      if (!input.appointmentId) return Response.json({ error: "Choose the new appointment before recording a rebooking." }, { status: 400 });
      const match = await d1.prepare(`
        SELECT f.id FROM follow_ups f
        JOIN appointments a ON a.tenant_id = f.tenant_id AND a.patient_id = f.patient_id
        WHERE f.tenant_id = ? AND f.id = ? AND a.id = ? LIMIT 1
      `).bind(actor.tenantId, input.id, input.appointmentId).first();
      if (!match) return Response.json({ error: "The appointment does not belong to this follow-up patient." }, { status: 409 });
    }
    const update = await d1.prepare(`
      UPDATE follow_ups SET status = ?, completed_at_ms = CASE WHEN ? = 'COMPLETED' THEN ? ELSE completed_at_ms END,
        booked_appointment_id = CASE WHEN ? = 'BOOKED' THEN ? ELSE booked_appointment_id END,
        updated_at_ms = ? WHERE tenant_id = ? AND id = ? RETURNING id
    `).bind(status, status, now, status, input.appointmentId ?? null, now, actor.tenantId, input.id).first();
    if (!update) return Response.json({ error: "Follow-up not found" }, { status: 404 });
    await d1.prepare(`
      INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, `followup.${input.action.toLowerCase()}`, "follow_up", input.id, "SUCCESS", requestId(request), "{}", now).run();
    return Response.json({ id: input.id, status, bookedAppointmentId: input.appointmentId ?? null });
  } catch (error) {
    return jsonError(error, "Unable to update follow-up");
  }
}
