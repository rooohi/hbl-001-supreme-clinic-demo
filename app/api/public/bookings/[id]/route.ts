import { getD1 } from "@/db";
import { TWACHA_TENANT_ID } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { checkPublicRateLimit, sha256Hex } from "@/server/patient-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await checkPublicRateLimit(request, "public-booking-status", 120);
    const tokenHash = await sha256Hex(id);
    const result = await getD1().prepare(`
      SELECT a.id,a.status,a.service_name_snapshot AS serviceName,a.scheduled_at_ms AS scheduledAt,
        qe.token_number AS tokenNumber,qe.status AS queueStatus,qe.estimated_wait_seconds AS estimatedWaitSeconds,
        q.service_date_local AS queueDate,
        CASE WHEN qe.status IN ('WAITING','CALLED') THEN
          (SELECT COUNT(*) FROM queue_entries active
            WHERE active.tenant_id = qe.tenant_id AND active.queue_id = qe.queue_id AND active.status = 'IN_CONSULTATION') +
          (SELECT COUNT(*) FROM queue_entries pending
            WHERE pending.tenant_id = qe.tenant_id AND pending.queue_id = qe.queue_id
              AND pending.status IN ('WAITING','CALLED') AND pending.sequence_number < qe.sequence_number)
        ELSE NULL END AS patientsAhead,
        pat.id AS accessTokenId
      FROM patient_access_tokens pat
      JOIN appointments a ON a.tenant_id = pat.tenant_id AND a.id = pat.appointment_id
      LEFT JOIN queue_entries qe ON qe.tenant_id = a.tenant_id AND qe.appointment_id = a.id
      LEFT JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
      WHERE pat.tenant_id = ? AND pat.token_hash = ? AND pat.purpose = 'BOOKING_STATUS'
        AND pat.revoked_at_ms IS NULL AND pat.expires_at_ms > ?
      LIMIT 1
    `).bind(TWACHA_TENANT_ID, tokenHash, Date.now()).first<Record<string, unknown>>();
    if (!result) return Response.json({ error: "Booking not found" }, { status: 404 });
    await getD1().prepare("UPDATE patient_access_tokens SET last_used_at_ms = ?, updated_at_ms = ? WHERE tenant_id = ? AND id = ?")
      .bind(Date.now(), Date.now(), TWACHA_TENANT_ID, result.accessTokenId).run();
    const booking = { ...result };
    delete booking.accessTokenId;
    return Response.json({ booking, privacy: "No patient name, contact details, or clinical notes are exposed on this status endpoint." }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) { return jsonError(error, "Unable to load booking status"); }
}
