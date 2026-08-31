import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

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
