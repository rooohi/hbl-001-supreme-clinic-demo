import { getD1 } from "@/db";
import { indiaDayBounds, localDateInIndia, requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const date = new URL(request.url).searchParams.get("date") ?? localDateInIndia();
    const { start, end } = indiaDayBounds(date);
    const d1 = getD1();

    const [appointments, queue, followUps, patientCount] = await Promise.all([
      d1.prepare(`
        SELECT a.id, a.appointment_type AS type, a.status, a.booking_source AS source,
          a.service_name_snapshot AS serviceName, a.duration_minutes_snapshot AS durationMinutes,
          a.scheduled_at_ms AS scheduledAt, a.row_version AS rowVersion,
          p.display_name AS patientName, p.patient_number AS patientNumber, p.phone_last4 AS phoneLast4
        FROM appointments a
        JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
        WHERE a.tenant_id = ? AND a.location_id = ? AND a.scheduled_at_ms >= ? AND a.scheduled_at_ms < ?
        ORDER BY a.scheduled_at_ms ASC
      `).bind(actor.tenantId, actor.locationId, start, end).all(),
      d1.prepare(`
        SELECT qe.id, qe.token_number AS tokenNumber, qe.sequence_number AS sequenceNumber,
          qe.status, qe.estimated_wait_seconds AS estimatedWaitSeconds,
          qe.estimated_duration_seconds AS estimatedDurationSeconds,
          qe.row_version AS rowVersion, a.id AS appointmentId,
          a.service_name_snapshot AS serviceName, p.display_name AS patientName
        FROM queue_entries qe
        JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = qe.appointment_id
        JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
        JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
        WHERE qe.tenant_id = ? AND q.location_id = ? AND q.service_date_local = ?
        ORDER BY CASE qe.status WHEN 'IN_CONSULTATION' THEN 0 WHEN 'CALLED' THEN 1 WHEN 'WAITING' THEN 2 ELSE 3 END,
          qe.sequence_number ASC
      `).bind(actor.tenantId, actor.locationId, date).all(),
      d1.prepare(`
        SELECT f.id, f.status, f.due_local_date AS dueDate, f.interval_code AS intervalCode,
          f.note, p.display_name AS patientName, p.patient_number AS patientNumber
        FROM follow_ups f
        JOIN patients p ON p.tenant_id = f.tenant_id AND p.id = f.patient_id
        WHERE f.tenant_id = ? AND f.status IN ('DUE','OVERDUE','UPCOMING')
        ORDER BY f.due_local_date ASC LIMIT 8
      `).bind(actor.tenantId).all(),
      d1.prepare("SELECT COUNT(*) AS count FROM patients WHERE tenant_id = ? AND status = 'ACTIVE'")
        .bind(actor.tenantId).first<{ count: number }>(),
    ]);

    const appointmentRows = appointments.results as Array<{ status: string; source: string; type: string }>;
    const queueRows = queue.results as Array<{ status: string; estimatedWaitSeconds: number | null }>;
    const activeWaits = queueRows.filter((row) => row.status === "WAITING" || row.status === "CALLED");
    const averageWait = activeWaits.length
      ? Math.round(activeWaits.reduce((sum, row) => sum + (row.estimatedWaitSeconds ?? 0), 0) / activeWaits.length / 60)
      : 0;

    return Response.json({
      date,
      actor: { name: actor.displayName, role: actor.role },
      metrics: {
        appointments: appointmentRows.length,
        completed: appointmentRows.filter((row) => row.status === "COMPLETED").length,
        waiting: activeWaits.length,
        cancelled: appointmentRows.filter((row) => row.status === "CANCELLED").length,
        noShows: appointmentRows.filter((row) => row.status === "NO_SHOW").length,
        newPatients: appointmentRows.filter((row) => row.type === "NEW_CONSULTATION").length,
        followUpsDue: (followUps.results as Array<{ status: string }>).filter((row) => row.status === "DUE" || row.status === "OVERDUE").length,
        averageWait,
        activePatients: patientCount?.count ?? 0,
      },
      appointments: appointments.results,
      queue: queue.results,
      followUps: followUps.results,
      configuration: {
        data: "persistent-d1",
        realtime: "polling-preview",
        communications: "development-adapter",
      },
    });
  } catch (error) {
    return jsonError(error, "Unable to load the clinic command center");
  }
}
