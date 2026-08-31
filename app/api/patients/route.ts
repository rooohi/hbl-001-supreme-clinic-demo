import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patientSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(18),
  email: z.string().trim().email().max(254).or(z.literal("")).optional().default(""),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")).optional().default(""),
  gender: z.enum(["FEMALE", "MALE", "NON_BINARY", "OTHER", "UNDISCLOSED"]).default("UNDISCLOSED"),
});

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) throw new Error("Enter a valid mobile number");
  return `+91${local}`;
}

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "patients.read");
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    const term = `%${query.replace(/[%_]/g, "")}%`;
    const result = await getD1().prepare(`
      SELECT p.id, p.patient_number AS patientNumber, p.display_name AS displayName,
        p.phone_last4 AS phoneLast4, p.email, p.status,
        COUNT(a.id) AS visitCount, MAX(a.scheduled_at_ms) AS lastVisitAt
      FROM patients p
      LEFT JOIN appointments a ON a.tenant_id = p.tenant_id AND a.patient_id = p.id AND a.status = 'COMPLETED'
      WHERE p.tenant_id = ? AND p.status = 'ACTIVE'
        AND (? = '' OR p.display_name LIKE ? COLLATE NOCASE OR p.patient_number LIKE ? COLLATE NOCASE OR p.phone_e164 LIKE ?)
      GROUP BY p.tenant_id, p.id
      ORDER BY COALESCE(MAX(a.scheduled_at_ms), p.created_at_ms) DESC
      LIMIT 40
    `).bind(actor.tenantId, query, term, term, term).all();
    return Response.json({ patients: result.results, query });
  } catch (error) {
    return jsonError(error, "Unable to search patients");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "patients.write");
    const input = patientSchema.parse(await request.json());
    const phone = normalizePhone(input.phone);
    const d1 = getD1();
    const existing = await d1.prepare(
      "SELECT id,patient_number AS patientNumber,display_name AS displayName FROM patients WHERE tenant_id = ? AND phone_e164 = ? AND status = 'ACTIVE' LIMIT 1",
    ).bind(actor.tenantId, phone).first<{ id: string; patientNumber: string; displayName: string }>();
    if (existing) return Response.json({ error: `A patient record already exists for this mobile number (${existing.patientNumber}).` }, { status: 409 });

    const id = crypto.randomUUID();
    const patientNumber = `TWC-${String(Date.now()).slice(-8)}-${id.slice(0, 4).toUpperCase()}`;
    const now = Date.now();
    await d1.batch([
      d1.prepare(`
        INSERT INTO patients (tenant_id,id,patient_number,display_name,phone_e164,phone_last4,email,date_of_birth,gender,preferred_locale,status,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,'en-IN','ACTIVE',?,?)
      `).bind(actor.tenantId, id, patientNumber, input.displayName, phone, phone.slice(-4),
        input.email || null, input.dateOfBirth || null, input.gender, now, now),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "patient.created",
        "patient", id, "SUCCESS", requestId(request), JSON.stringify({ source: "STAFF_DIRECTORY" }), now),
    ]);
    return Response.json({ patient: { id, patientNumber, displayName: input.displayName, phoneLast4: phone.slice(-4), email: input.email || null, status: "ACTIVE", visitCount: 0, lastVisitAt: null } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create patient");
  }
}
