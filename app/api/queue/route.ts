import { z } from "zod";
import { getD1 } from "@/db";
import { TWACHA_PROVIDER_ID, localDateInIndia, requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { estimateQueue, type WaitEntry } from "@/server/wait-time.mjs";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  entryId: z.string().uuid(),
  action: z.enum(["CALL", "START", "COMPLETE", "SKIP", "NO_SHOW", "RETURN_TO_WAITING"]),
  rowVersion: z.number().int().positive(),
  followUpInterval: z.enum(["3D", "7D", "15D", "1M", "3M", "CUSTOM"]).optional(),
});

const transitions = {
  WAITING: { CALL: "CALLED", START: "IN_CONSULTATION", SKIP: "SKIPPED", NO_SHOW: "NO_SHOW" },
  CALLED: { START: "IN_CONSULTATION", SKIP: "SKIPPED", NO_SHOW: "NO_SHOW", RETURN_TO_WAITING: "WAITING" },
  IN_CONSULTATION: { COMPLETE: "COMPLETED" },
  SKIPPED: { RETURN_TO_WAITING: "WAITING", NO_SHOW: "NO_SHOW" },
} as const;

type QueueRow = {
  id: string;
  queueId: string;
  providerId: string;
  appointmentId: string;
  tokenNumber: number;
  sequenceNumber: number;
  status: WaitEntry["status"];
  estimatedDurationSeconds: number;
  estimatedStartAt: number | null;
  estimatedWaitSeconds: number | null;
  startedAt: number | null;
  rowVersion: number;
  patientId: string;
  patientName: string;
  patientNumber: string;
  serviceName: string;
  scheduledAt: number;
};

async function getQueueRows(
  d1: ReturnType<typeof getD1>,
  tenantId: string,
  locationId: string,
  date: string,
  filters: { queueId?: string; providerId?: string } = {},
) {
  const result = await d1.prepare(`
    SELECT qe.id, qe.queue_id AS queueId, qe.appointment_id AS appointmentId,
      qe.token_number AS tokenNumber, qe.sequence_number AS sequenceNumber, qe.status,
      qe.estimated_duration_seconds AS estimatedDurationSeconds,
      qe.estimated_start_at_ms AS estimatedStartAt,
      qe.estimated_wait_seconds AS estimatedWaitSeconds,
      qe.started_at_ms AS startedAt, qe.row_version AS rowVersion,
      q.provider_id AS providerId,
      a.patient_id AS patientId, a.service_name_snapshot AS serviceName,
      a.scheduled_at_ms AS scheduledAt, p.display_name AS patientName, p.patient_number AS patientNumber
    FROM queue_entries qe
    JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = qe.appointment_id
    JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
    JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
    WHERE qe.tenant_id = ? AND q.location_id = ? AND q.service_date_local = ?
      AND (? IS NULL OR qe.queue_id = ?)
      AND (? IS NULL OR q.provider_id = ?)
    ORDER BY CASE qe.status WHEN 'IN_CONSULTATION' THEN 0 WHEN 'CALLED' THEN 1 WHEN 'WAITING' THEN 2 ELSE 3 END,
      qe.sequence_number ASC
  `).bind(
    tenantId,
    locationId,
    date,
    filters.queueId ?? null,
    filters.queueId ?? null,
    filters.providerId ?? null,
    filters.providerId ?? null,
  ).all<QueueRow>();
  return result.results;
}

function addPatientsAhead(rows: QueueRow[]) {
  const positions = new Map<string, number>();
  const groups = new Map<string, QueueRow[]>();
  for (const row of rows) {
    const group = groups.get(row.queueId) ?? [];
    group.push(row);
    groups.set(row.queueId, group);
  }
  for (const group of groups.values()) {
    const activeCount = group.filter((entry) => entry.status === "IN_CONSULTATION").length;
    const pending = group
      .filter((entry) => entry.status === "CALLED" || entry.status === "WAITING")
      .sort((a, b) => {
        if (a.status === "CALLED" && b.status !== "CALLED") return -1;
        if (b.status === "CALLED" && a.status !== "CALLED") return 1;
        return a.sequenceNumber - b.sequenceNumber || a.id.localeCompare(b.id);
      });
    pending.forEach((entry, index) => positions.set(entry.id, activeCount + index));
  }
  return rows.map((row) => ({ ...row, patientsAhead: positions.get(row.id) ?? null }));
}

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "queue.read");
    const params = new URL(request.url).searchParams;
    const date = params.get("date") ?? localDateInIndia();
    const requestedProviderId = params.get("providerId") ?? undefined;
    if (actor.role === "doctor" && requestedProviderId && requestedProviderId !== actor.staffId) {
      return Response.json({ error: "Doctors can only operate their own queue." }, { status: 403 });
    }
    const providerId = actor.role === "doctor" ? actor.staffId : requestedProviderId ?? TWACHA_PROVIDER_ID;
    const rows = await getQueueRows(getD1(), actor.tenantId, actor.locationId, date, { providerId });
    return Response.json({ queue: addPatientsAhead(rows), date, providerId, estimateLabel: "Estimated from the current provider queue and typical service duration" });
  } catch (error) {
    return jsonError(error, "Unable to load the live queue");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "queue.manage");
    const input = actionSchema.parse(await request.json());
    const d1 = getD1();
    const row = await d1.prepare(`
      SELECT qe.id, qe.queue_id AS queueId, qe.appointment_id AS appointmentId,
        qe.status, qe.row_version AS rowVersion, qe.started_at_ms AS startedAt,
        qe.completed_at_ms AS completedAt,
        a.patient_id AS patientId, a.provider_id AS providerId,
        a.status AS appointmentStatus, a.row_version AS appointmentRowVersion,
        q.service_date_local AS queueDate
      FROM queue_entries qe
      JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = qe.appointment_id
      JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
      WHERE qe.tenant_id = ? AND q.location_id = ? AND qe.id = ? LIMIT 1
    `).bind(actor.tenantId, actor.locationId, input.entryId).first<{
      id: string;
      queueId: string;
      appointmentId: string;
      status: keyof typeof transitions;
      rowVersion: number;
      startedAt: number | null;
      completedAt: number | null;
      patientId: string;
      providerId: string;
      appointmentStatus: string;
      appointmentRowVersion: number;
      queueDate: string;
    }>();
    if (!row) return Response.json({ error: "Queue entry not found" }, { status: 404 });
    if (actor.role === "doctor" && row.providerId !== actor.staffId) {
      return Response.json({ error: "Doctors can only operate their own queue." }, { status: 403 });
    }
    if (row.rowVersion !== input.rowVersion) return Response.json({ error: "The queue changed. Refresh and try again.", code: "VERSION_CONFLICT" }, { status: 409 });

    const transitionTable: Record<string, Partial<Record<string, string>>> = transitions;
    const nextStatus = transitionTable[row.status]?.[input.action];
    if (!nextStatus) return Response.json({ error: `Cannot ${input.action.toLowerCase().replaceAll("_", " ")} from ${row.status.toLowerCase()}.` }, { status: 409 });

    const compatibleAppointmentStatuses: Record<string, string[]> = {
      WAITING: ["WAITING", "ARRIVED"],
      CALLED: ["WAITING"],
      IN_CONSULTATION: ["IN_CONSULTATION"],
      SKIPPED: ["SKIPPED"],
    };
    if (!compatibleAppointmentStatuses[row.status]?.includes(row.appointmentStatus)) {
      return Response.json({ error: "The appointment and queue are out of sync. Refresh before changing this entry.", code: "STATE_CONFLICT" }, { status: 409 });
    }

    if (nextStatus === "IN_CONSULTATION") {
      const active = await d1.prepare(
        "SELECT id FROM queue_entries WHERE tenant_id = ? AND queue_id = ? AND status = 'IN_CONSULTATION' AND id <> ? LIMIT 1",
      ).bind(actor.tenantId, row.queueId, row.id).first();
      if (active) return Response.json({ error: "Another consultation is already active for this provider." }, { status: 409 });
    }

    const now = Date.now();
    const appointmentStatus = nextStatus === "CALLED" || nextStatus === "WAITING" ? "WAITING" : nextStatus;
    const statements = [
      d1.prepare(`
        UPDATE queue_entries SET status = ?, row_version = row_version + 1,
          started_at_ms = CASE WHEN ? = 'IN_CONSULTATION' THEN ? ELSE started_at_ms END,
          completed_at_ms = CASE WHEN ? = 'COMPLETED' THEN ? ELSE completed_at_ms END
        WHERE tenant_id = ? AND id = ? AND status = ? AND row_version = ?
      `).bind(nextStatus, nextStatus, now, nextStatus, now, actor.tenantId, row.id, row.status, input.rowVersion),
      d1.prepare(`
        UPDATE appointments SET status = ?, row_version = row_version + 1, updated_at_ms = ?,
          consultation_started_at_ms = CASE WHEN ? = 'IN_CONSULTATION' THEN ? ELSE consultation_started_at_ms END,
          consultation_ended_at_ms = CASE WHEN ? = 'COMPLETED' THEN ? ELSE consultation_ended_at_ms END
        WHERE tenant_id = ? AND id = ? AND status = ? AND row_version = ?
      `).bind(appointmentStatus, now, nextStatus, now, nextStatus, now, actor.tenantId, row.appointmentId, row.appointmentStatus, row.appointmentRowVersion),
      d1.prepare(`
        INSERT INTO appointment_events (tenant_id,id,appointment_id,event_type,from_status,to_status,actor_type,actor_id,metadata_json,occurred_at_ms)
        SELECT ?,?,?,?,?,?,?,?,?,?
        WHERE EXISTS (
          SELECT 1 FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = ?
          WHERE qe.tenant_id = ? AND qe.id = ? AND qe.status = ? AND qe.row_version = ?
            AND a.status = ? AND a.row_version = ? AND a.updated_at_ms = ?
        )
      `).bind(
        actor.tenantId, crypto.randomUUID(), row.appointmentId, `queue.${input.action.toLowerCase()}`,
        row.appointmentStatus, appointmentStatus, "STAFF", actor.staffId, "{}", now,
        row.appointmentId, actor.tenantId, row.id, nextStatus, input.rowVersion + 1,
        appointmentStatus, row.appointmentRowVersion + 1, now,
      ),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        SELECT ?,?,?,?,?,?,?,?,?,?,?
        WHERE EXISTS (
          SELECT 1 FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = ?
          WHERE qe.tenant_id = ? AND qe.id = ? AND qe.status = ? AND qe.row_version = ?
            AND a.status = ? AND a.row_version = ? AND a.updated_at_ms = ?
        )
      `).bind(
        actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, `queue.${input.action.toLowerCase()}`,
        "queue_entry", row.id, "SUCCESS", requestId(request), "{}", now,
        row.appointmentId, actor.tenantId, row.id, nextStatus, input.rowVersion + 1,
        appointmentStatus, row.appointmentRowVersion + 1, now,
      ),
    ];

    if (nextStatus === "IN_CONSULTATION") {
      statements.push(d1.prepare(`
        INSERT INTO consultations (tenant_id,id,appointment_id,patient_id,provider_id,status,started_at_ms,created_at_ms,updated_at_ms)
        SELECT ?,?,?,?,?, 'IN_PROGRESS',?,?,?
        WHERE EXISTS (
          SELECT 1 FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = ?
          WHERE qe.tenant_id = ? AND qe.id = ? AND qe.status = 'IN_CONSULTATION' AND qe.row_version = ?
            AND a.status = 'IN_CONSULTATION' AND a.row_version = ? AND a.updated_at_ms = ?
        )
        ON CONFLICT(tenant_id,appointment_id) DO UPDATE SET status = 'IN_PROGRESS', updated_at_ms = excluded.updated_at_ms
      `).bind(
        actor.tenantId, crypto.randomUUID(), row.appointmentId, row.patientId, row.providerId, now, now, now,
        row.appointmentId, actor.tenantId, row.id, input.rowVersion + 1, row.appointmentRowVersion + 1, now,
      ));
    }

    if (nextStatus === "COMPLETED") {
      statements.push(d1.prepare(`
        INSERT INTO consultations (tenant_id,id,appointment_id,patient_id,provider_id,status,started_at_ms,ended_at_ms,created_at_ms,updated_at_ms)
        SELECT ?,?,?,?,?, 'COMPLETED',?,?,?,?
        WHERE EXISTS (
          SELECT 1 FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = ?
          WHERE qe.tenant_id = ? AND qe.id = ? AND qe.status = 'COMPLETED' AND qe.row_version = ?
            AND a.status = 'COMPLETED' AND a.row_version = ? AND a.updated_at_ms = ?
        )
        ON CONFLICT(tenant_id,appointment_id) DO UPDATE SET status = 'COMPLETED', ended_at_ms = excluded.ended_at_ms, updated_at_ms = excluded.updated_at_ms
      `).bind(
        actor.tenantId, crypto.randomUUID(), row.appointmentId, row.patientId, row.providerId,
        row.startedAt ?? now, now, now, now,
        row.appointmentId, actor.tenantId, row.id, input.rowVersion + 1, row.appointmentRowVersion + 1, now,
      ));
    }

    if (nextStatus === "COMPLETED" && input.followUpInterval) {
      const days = { "3D": 3, "7D": 7, "15D": 15, "1M": 30, "3M": 90, "CUSTOM": 7 }[input.followUpInterval];
      const due = new Date(now + days * 86_400_000).toISOString().slice(0, 10);
      statements.push(d1.prepare(`
        INSERT INTO follow_ups (tenant_id,id,patient_id,source_appointment_id,assigned_staff_id,interval_code,due_local_date,status,note,created_at_ms,updated_at_ms)
        SELECT ?,?,?,?,?,?,?,?,?,?,?
        WHERE EXISTS (
          SELECT 1 FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = ?
          WHERE qe.tenant_id = ? AND qe.id = ? AND qe.status = 'COMPLETED' AND qe.row_version = ?
            AND a.status = 'COMPLETED' AND a.row_version = ? AND a.updated_at_ms = ?
        )
      `).bind(
        actor.tenantId, crypto.randomUUID(), row.patientId, row.appointmentId, actor.staffId,
        input.followUpInterval, due, "UPCOMING", "Created when consultation completed", now, now,
        row.appointmentId, actor.tenantId, row.id, input.rowVersion + 1, row.appointmentRowVersion + 1, now,
      ));
    }

    await d1.batch(statements);

    const committed = await d1.prepare(`
      SELECT qe.status AS queueStatus, qe.row_version AS queueRowVersion,
        a.status AS appointmentStatus, a.row_version AS appointmentRowVersion,
        a.updated_at_ms AS appointmentUpdatedAt
      FROM queue_entries qe
      JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = qe.appointment_id
      WHERE qe.tenant_id = ? AND qe.id = ? LIMIT 1
    `).bind(actor.tenantId, row.id).first<{
      queueStatus: string;
      queueRowVersion: number;
      appointmentStatus: string;
      appointmentRowVersion: number;
      appointmentUpdatedAt: number;
    }>();
    if (
      !committed
      || committed.queueStatus !== nextStatus
      || committed.queueRowVersion !== input.rowVersion + 1
      || committed.appointmentStatus !== appointmentStatus
      || committed.appointmentRowVersion !== row.appointmentRowVersion + 1
      || committed.appointmentUpdatedAt !== now
    ) {
      return Response.json({ error: "The queue changed while this action was being saved. Refresh and try again.", code: "VERSION_CONFLICT" }, { status: 409 });
    }

    const fresh = await getQueueRows(d1, actor.tenantId, actor.locationId, row.queueDate, { queueId: row.queueId });
    const estimates = estimateQueue(fresh.map((entry) => ({
      id: entry.id,
      status: entry.status,
      sequenceNumber: entry.sequenceNumber,
      estimatedDurationSeconds: entry.estimatedDurationSeconds,
      startedAt: entry.startedAt,
    })), now);
    if (estimates.length) {
      await d1.batch(estimates.map((estimate) => d1.prepare(
        "UPDATE queue_entries SET estimated_start_at_ms = ?, estimated_wait_seconds = ? WHERE tenant_id = ? AND id = ?",
      ).bind(estimate.estimatedStartAt, estimate.estimatedWaitSeconds, actor.tenantId, estimate.id)));
    }

    const updated = await getQueueRows(d1, actor.tenantId, actor.locationId, row.queueDate, { providerId: row.providerId });
    return Response.json({ queue: addPatientsAhead(updated), updatedEntryId: row.id, status: nextStatus, providerId: row.providerId });
  } catch (error) {
    return jsonError(error, "Unable to update the queue");
  }
}
