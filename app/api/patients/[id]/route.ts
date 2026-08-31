import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "patients.read");
    const { id } = await params;
    const d1 = getD1();
    const patient = await d1.prepare(`
      SELECT id,patient_number AS patientNumber,display_name AS displayName,phone_last4 AS phoneLast4,
        email,date_of_birth AS dateOfBirth,gender,status,created_at_ms AS createdAt
      FROM patients WHERE tenant_id = ? AND id = ? LIMIT 1
    `).bind(actor.tenantId, id).first();
    if (!patient) return Response.json({ error: "Patient record not found" }, { status: 404 });

    const [appointments, consultations, invoices, followUps] = await Promise.all([
      d1.prepare(`
        SELECT id,scheduled_at_ms AS occurredAt,service_name_snapshot AS title,status,
          appointment_type AS type,reason,notes
        FROM appointments WHERE tenant_id = ? AND patient_id = ? ORDER BY scheduled_at_ms DESC LIMIT 30
      `).bind(actor.tenantId, id).all(),
      d1.prepare(`
        SELECT id,started_at_ms AS occurredAt,status,clinical_note AS clinicalNote,follow_up_plan AS followUpPlan
        FROM consultations WHERE tenant_id = ? AND patient_id = ? ORDER BY started_at_ms DESC LIMIT 20
      `).bind(actor.tenantId, id).all(),
      d1.prepare(`
        SELECT id,invoice_number AS invoiceNumber,status,total_paise AS totalPaise,paid_paise AS paidPaise,
          issued_at_ms AS occurredAt
        FROM invoices WHERE tenant_id = ? AND patient_id = ? ORDER BY created_at_ms DESC LIMIT 20
      `).bind(actor.tenantId, id).all(),
      d1.prepare(`
        SELECT id,due_local_date AS dueDate,status,note FROM follow_ups
        WHERE tenant_id = ? AND patient_id = ? ORDER BY due_local_date DESC LIMIT 20
      `).bind(actor.tenantId, id).all(),
    ]);

    return Response.json({
      patient,
      timeline: {
        appointments: appointments.results,
        consultations: consultations.results,
        invoices: invoices.results,
        followUps: followUps.results,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load patient timeline");
  }
}
