import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

const medicationSchema = z.object({
  medicineName: z.string().trim().min(1).max(160),
  genericName: z.string().trim().max(160).optional().default(""),
  strength: z.string().trim().max(80).optional().default(""),
  dose: z.string().trim().min(1).max(80),
  route: z.string().trim().min(1).max(80).default("Oral"),
  frequency: z.string().trim().min(1).max(120),
  timing: z.string().trim().max(120).optional().default(""),
  durationDays: z.number().int().min(1).max(3650).nullable().optional().default(null),
  instructions: z.string().trim().max(500).optional().default(""),
});

const saveSchema = z.object({
  appointmentId: z.string().uuid(),
  clinicalNote: z.string().trim().min(1).max(20_000),
  followUpPlan: z.string().trim().max(2_000).optional().default(""),
  medications: z.array(medicationSchema).max(25).default([]),
  action: z.enum(["SAVE_DRAFT", "SIGN", "AMEND"]).default("SAVE_DRAFT"),
});

type ConsultationRow = {
  appointmentId: string;
  consultationId: string | null;
  consultationStatus: string | null;
  clinicalNote: string | null;
  followUpPlan: string | null;
  scheduledAt: number;
  appointmentStatus: string;
  serviceName: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  phoneLast4: string;
  priorVisits: number;
  prescriptionId: string | null;
  prescriptionStatus: string | null;
  prescriptionNumber: string | null;
  invoiceId: string | null;
  invoiceStatus: string | null;
};

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "clinical.read");
    const rows = await getD1().prepare(`
      SELECT
        a.id AS appointmentId,
        c.id AS consultationId,
        c.status AS consultationStatus,
        c.clinical_note AS clinicalNote,
        c.follow_up_plan AS followUpPlan,
        a.scheduled_at_ms AS scheduledAt,
        a.status AS appointmentStatus,
        a.service_name_snapshot AS serviceName,
        p.id AS patientId,
        p.display_name AS patientName,
        p.patient_number AS patientNumber,
        p.phone_last4 AS phoneLast4,
        (SELECT COUNT(*) FROM consultations pc WHERE pc.tenant_id = a.tenant_id AND pc.patient_id = a.patient_id AND pc.status IN ('COMPLETED','SIGNED','AMENDED') AND pc.appointment_id <> a.id) AS priorVisits,
        rx.id AS prescriptionId,
        rx.status AS prescriptionStatus,
        rx.prescription_number AS prescriptionNumber,
        i.id AS invoiceId,
        i.status AS invoiceStatus
      FROM appointments a
      JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
      LEFT JOIN consultations c ON c.tenant_id = a.tenant_id AND c.appointment_id = a.id
      LEFT JOIN prescriptions rx ON rx.tenant_id = a.tenant_id AND rx.appointment_id = a.id
      LEFT JOIN invoices i ON i.tenant_id = a.tenant_id AND i.appointment_id = a.id AND i.status <> 'VOID'
      WHERE a.tenant_id = ? AND a.provider_id = ?
        AND a.status IN ('ARRIVED','WAITING','IN_CONSULTATION','COMPLETED')
      ORDER BY CASE a.status WHEN 'IN_CONSULTATION' THEN 0 WHEN 'WAITING' THEN 1 WHEN 'ARRIVED' THEN 2 ELSE 3 END,
        a.scheduled_at_ms DESC
      LIMIT 60
    `).bind(actor.tenantId, actor.staffId).all<ConsultationRow>();

    const medicationRows = await getD1().prepare(`
      SELECT pi.prescription_id AS prescriptionId, pi.id, pi.medicine_name AS medicineName,
        pi.generic_name AS genericName, pi.strength, pi.dose, pi.route, pi.frequency,
        pi.timing, pi.duration_days AS durationDays, pi.instructions
      FROM prescription_items pi
      JOIN prescriptions p ON p.tenant_id = pi.tenant_id AND p.id = pi.prescription_id
      WHERE pi.tenant_id = ? AND p.provider_id = ?
      ORDER BY pi.prescription_id, pi.sort_order
      LIMIT 500
    `).bind(actor.tenantId, actor.staffId).all<Record<string, unknown>>();

    const grouped = new Map<string, Record<string, unknown>[]>();
    for (const item of medicationRows.results) {
      const key = String(item.prescriptionId);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }

    return Response.json({
      consultations: rows.results.map((row) => ({
        ...row,
        medications: row.prescriptionId ? grouped.get(row.prescriptionId) ?? [] : [],
      })),
      safety: {
        mode: "CLINICIAN_REVIEW_REQUIRED",
        statement: "Clinical notes and prescriptions are never finalized without an explicit clinician action.",
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load consultations");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "clinical.write");
    const input = saveSchema.parse(await request.json());
    const d1 = getD1();
    const appointment = await d1.prepare(`
      SELECT a.id, a.patient_id AS patientId, a.provider_id AS providerId, a.status,
        a.consultation_started_at_ms AS startedAt,
        c.id AS consultationId, c.status AS consultationStatus,
        rx.id AS prescriptionId, rx.status AS prescriptionStatus
      FROM appointments a
      LEFT JOIN consultations c ON c.tenant_id = a.tenant_id AND c.appointment_id = a.id
      LEFT JOIN prescriptions rx ON rx.tenant_id = a.tenant_id AND rx.appointment_id = a.id
      WHERE a.tenant_id = ? AND a.id = ? AND a.provider_id = ? LIMIT 1
    `).bind(actor.tenantId, input.appointmentId, actor.staffId).first<{
      id: string; patientId: string; providerId: string; status: string; startedAt: number | null;
      consultationId: string | null; consultationStatus: string | null;
      prescriptionId: string | null; prescriptionStatus: string | null;
    }>();
    if (!appointment) return Response.json({ error: "Consultation appointment not found" }, { status: 404 });
    if (!['IN_CONSULTATION', 'COMPLETED'].includes(appointment.status)) {
      return Response.json({ error: "Start the consultation before recording a clinical note.", code: "CONSULTATION_NOT_STARTED" }, { status: 409 });
    }
    if (appointment.consultationStatus === "SIGNED" && input.action !== "AMEND") {
      return Response.json({ error: "This note is signed. Use the amend action to preserve its audit history.", code: "SIGNED_RECORD" }, { status: 409 });
    }

    const now = Date.now();
    const consultationId = appointment.consultationId ?? crypto.randomUUID();
    const prescriptionId = appointment.prescriptionId ?? crypto.randomUUID();
    const targetStatus = input.action === "SIGN" ? "SIGNED" : input.action === "AMEND" ? "AMENDED" : "IN_PROGRESS";
    const prescriptionStatus = input.action === "SAVE_DRAFT" ? "DRAFT" : "FINAL";
    const prescriptionNumber = `RX-${new Date(now).toISOString().slice(0, 10).replaceAll("-", "")}-${input.appointmentId.slice(0, 6).toUpperCase()}`;

    const statements = [
      d1.prepare(`
        INSERT INTO consultations (tenant_id,id,appointment_id,patient_id,provider_id,status,clinical_note,follow_up_plan,started_at_ms,ended_at_ms,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tenant_id,appointment_id) DO UPDATE SET
          status = excluded.status, clinical_note = excluded.clinical_note,
          follow_up_plan = excluded.follow_up_plan,
          ended_at_ms = CASE WHEN excluded.status IN ('SIGNED','AMENDED') THEN excluded.ended_at_ms ELSE consultations.ended_at_ms END,
          updated_at_ms = excluded.updated_at_ms
      `).bind(actor.tenantId, consultationId, appointment.id, appointment.patientId, appointment.providerId,
        targetStatus, input.clinicalNote, input.followUpPlan || null, appointment.startedAt ?? now,
        targetStatus === "IN_PROGRESS" ? null : now, now, now),
      d1.prepare(`
        INSERT INTO prescriptions (tenant_id,id,appointment_id,patient_id,provider_id,prescription_number,status,clinical_instructions,signed_at_ms,row_version,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,1,?,?)
        ON CONFLICT(tenant_id,appointment_id) DO UPDATE SET
          status = excluded.status, clinical_instructions = excluded.clinical_instructions,
          signed_at_ms = excluded.signed_at_ms, row_version = prescriptions.row_version + 1,
          updated_at_ms = excluded.updated_at_ms
      `).bind(actor.tenantId, prescriptionId, appointment.id, appointment.patientId, appointment.providerId,
        prescriptionNumber, prescriptionStatus, input.followUpPlan || null,
        prescriptionStatus === "FINAL" ? now : null, now, now),
      d1.prepare("DELETE FROM prescription_items WHERE tenant_id = ? AND prescription_id = ?")
        .bind(actor.tenantId, prescriptionId),
      d1.prepare(`
        INSERT INTO appointment_events (tenant_id,id,appointment_id,event_type,from_status,to_status,actor_type,actor_id,metadata_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), appointment.id,
        input.action === "SAVE_DRAFT" ? "consultation.draft_saved" : input.action === "SIGN" ? "consultation.signed" : "consultation.amended",
        appointment.consultationStatus, targetStatus, "STAFF", actor.staffId,
        JSON.stringify({ medicationCount: input.medications.length }), now),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId,
        `consultation.${input.action.toLowerCase()}`, "consultation", consultationId, "SUCCESS", requestId(request),
        JSON.stringify({ medicationCount: input.medications.length }), now),
    ];

    input.medications.forEach((item, index) => {
      statements.splice(3 + index, 0, d1.prepare(`
        INSERT INTO prescription_items (tenant_id,id,prescription_id,medicine_name,generic_name,strength,dose,route,frequency,timing,duration_days,instructions,sort_order,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), prescriptionId, item.medicineName,
        item.genericName || null, item.strength || null, item.dose, item.route, item.frequency,
        item.timing || null, item.durationDays, item.instructions || null, index, now, now));
    });

    await d1.batch(statements);
    return Response.json({
      consultationId,
      prescriptionId,
      consultationStatus: targetStatus,
      prescriptionStatus,
      reviewRequired: false,
    });
  } catch (error) {
    return jsonError(error, "Unable to save the consultation");
  }
}
