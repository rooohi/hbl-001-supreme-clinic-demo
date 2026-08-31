import { getD1 } from "@/db";
import { indiaDayBounds, localDateInIndia, requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { estimateQueue, type WaitEntry } from "@/server/wait-time.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "queue.manage");
    const { id } = await params;
    const d1 = getD1();
    const appointment = await d1.prepare(`
      SELECT id, status, duration_minutes_snapshot AS durationMinutes,
        location_id AS locationId, provider_id AS providerId, scheduled_at_ms AS scheduledAt,
        row_version AS rowVersion
      FROM appointments WHERE tenant_id = ? AND id = ? LIMIT 1
    `).bind(actor.tenantId, id).first<{ id: string; status: string; durationMinutes: number; locationId: string; providerId: string; scheduledAt: number; rowVersion: number }>();
    if (!appointment) return Response.json({ error: "Appointment not found" }, { status: 404 });

    const date = localDateInIndia();
    const { start, end } = indiaDayBounds(date);
    if (appointment.locationId !== actor.locationId) return Response.json({ error: "This appointment belongs to another clinic location." }, { status: 403 });
    if (actor.role === "doctor" && appointment.providerId !== actor.staffId) return Response.json({ error: "Doctors can only check patients into their own queue." }, { status: 403 });
    if (appointment.scheduledAt < start || appointment.scheduledAt >= end) return Response.json({ error: "Only today’s appointments can be checked in." }, { status: 409 });
    const existing = await d1.prepare(
      "SELECT id, token_number AS tokenNumber, status, estimated_wait_seconds AS estimatedWaitSeconds FROM queue_entries WHERE tenant_id = ? AND appointment_id = ? LIMIT 1",
    ).bind(actor.tenantId, id).first();
    if (existing) return Response.json({ queueEntry: existing, replayed: true });
    if (!["SCHEDULED", "CONFIRMED", "ARRIVED"].includes(appointment.status)) {
      return Response.json({ error: `A ${appointment.status.toLowerCase()} appointment cannot be checked in.` }, { status: 409 });
    }

    let queue = await d1.prepare(`
      SELECT id, next_token AS nextToken, next_sequence AS nextSequence
      FROM queues WHERE tenant_id = ? AND location_id = ? AND provider_id = ? AND service_date_local = ? AND status = 'OPEN' LIMIT 1
    `).bind(actor.tenantId, appointment.locationId, appointment.providerId, date).first<{ id: string; nextToken: number; nextSequence: number }>();
    if (!queue) {
      await d1.prepare(`
        INSERT INTO queues (tenant_id,id,location_id,provider_id,service_date_local,status,next_token,next_sequence,estimate_version)
        VALUES (?,?,?,?,?,'OPEN',1,1,1)
        ON CONFLICT(tenant_id,location_id,provider_id,service_date_local) DO NOTHING
      `).bind(actor.tenantId, crypto.randomUUID(), appointment.locationId, appointment.providerId, date).run();
      queue = await d1.prepare(`
        SELECT id, next_token AS nextToken, next_sequence AS nextSequence
        FROM queues WHERE tenant_id = ? AND location_id = ? AND provider_id = ? AND service_date_local = ? AND status = 'OPEN' LIMIT 1
      `).bind(actor.tenantId, appointment.locationId, appointment.providerId, date).first<{ id: string; nextToken: number; nextSequence: number }>();
    }
    if (!queue) return Response.json({ error: "Today’s queue could not be opened." }, { status: 409 });

    const now = Date.now();
    let created: { id: string; tokenNumber: number; sequenceNumber: number } | null = null;
    let lastInsertError: unknown;

    // A stale queue counter produces a unique-token conflict and rolls the D1
    // batch back. Refreshing and retrying keeps token allocation monotonic
    // without ever checking a patient into a different provider queue.
    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      if (attempt > 0) {
        queue = await d1.prepare(`
          SELECT id, next_token AS nextToken, next_sequence AS nextSequence
          FROM queues WHERE tenant_id = ? AND location_id = ? AND provider_id = ? AND service_date_local = ? AND status = 'OPEN' LIMIT 1
        `).bind(actor.tenantId, appointment.locationId, appointment.providerId, date).first<{ id: string; nextToken: number; nextSequence: number }>();
        if (!queue) break;
      }

      const entryId = crypto.randomUUID();
      try {
        await d1.batch([
          d1.prepare(`
            UPDATE queues SET next_token = next_token + 1, next_sequence = next_sequence + 1, updated_at_ms = ?
            WHERE tenant_id = ? AND id = ? AND next_token = ? AND next_sequence = ?
              AND EXISTS (
                SELECT 1 FROM appointments a
                WHERE a.tenant_id = ? AND a.id = ? AND a.status = ? AND a.row_version = ?
              )
          `).bind(
            now, actor.tenantId, queue.id, queue.nextToken, queue.nextSequence,
            actor.tenantId, id, appointment.status, appointment.rowVersion,
          ),
          d1.prepare(`
            INSERT INTO queue_entries (tenant_id,id,queue_id,appointment_id,token_number,sequence_number,status,estimated_duration_seconds,estimated_wait_seconds,joined_at_ms,row_version)
            SELECT ?,?,?,?,?,?,'WAITING',?,?,?,1
            FROM queues q
            JOIN appointments a ON a.tenant_id = q.tenant_id AND a.id = ?
            WHERE q.tenant_id = ? AND q.id = ? AND q.next_token = ? AND q.next_sequence = ?
              AND a.status = ? AND a.row_version = ?
          `).bind(
            actor.tenantId, entryId, queue.id, id, queue.nextToken, queue.nextSequence,
            appointment.durationMinutes * 60, 0, now,
            id, actor.tenantId, queue.id, queue.nextToken + 1, queue.nextSequence + 1,
            appointment.status, appointment.rowVersion,
          ),
          d1.prepare(`
            UPDATE appointments SET status = 'WAITING', arrived_at_ms = ?, row_version = row_version + 1, updated_at_ms = ?
            WHERE tenant_id = ? AND id = ? AND status = ? AND row_version = ?
              AND EXISTS (SELECT 1 FROM queue_entries qe WHERE qe.tenant_id = ? AND qe.id = ? AND qe.appointment_id = ?)
          `).bind(
            now, now, actor.tenantId, id, appointment.status, appointment.rowVersion,
            actor.tenantId, entryId, id,
          ),
          d1.prepare(`
            INSERT INTO appointment_events (tenant_id,id,appointment_id,event_type,from_status,to_status,actor_type,actor_id,metadata_json,occurred_at_ms)
            SELECT ?,?,?, 'appointment.checked_in', ?, 'WAITING', 'STAFF', ?, ?, ?
            WHERE EXISTS (
              SELECT 1 FROM appointments a
              JOIN queue_entries qe ON qe.tenant_id = a.tenant_id AND qe.appointment_id = a.id
              WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'WAITING' AND a.row_version = ?
                AND a.updated_at_ms = ? AND qe.id = ?
            )
          `).bind(
            actor.tenantId, crypto.randomUUID(), id, appointment.status, actor.staffId,
            JSON.stringify({ tokenNumber: queue.nextToken }), now,
            actor.tenantId, id, appointment.rowVersion + 1, now, entryId,
          ),
          d1.prepare(`
            INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
            SELECT ?,?,'STAFF',?,'appointment.check_in','appointment',?,'SUCCESS',?,?,?
            WHERE EXISTS (
              SELECT 1 FROM appointments a
              JOIN queue_entries qe ON qe.tenant_id = a.tenant_id AND qe.appointment_id = a.id
              WHERE a.tenant_id = ? AND a.id = ? AND a.status = 'WAITING' AND a.row_version = ?
                AND a.updated_at_ms = ? AND qe.id = ?
            )
          `).bind(
            actor.tenantId, crypto.randomUUID(), actor.staffId, id, requestId(request),
            JSON.stringify({ tokenNumber: queue.nextToken }), now,
            actor.tenantId, id, appointment.rowVersion + 1, now, entryId,
          ),
        ]);

        const committed = await d1.prepare(`
          SELECT qe.id, qe.token_number AS tokenNumber, qe.sequence_number AS sequenceNumber
          FROM queue_entries qe
          JOIN appointments a ON a.tenant_id = qe.tenant_id AND a.id = qe.appointment_id
          WHERE qe.tenant_id = ? AND qe.id = ? AND a.status = 'WAITING'
            AND a.row_version = ? AND a.updated_at_ms = ? LIMIT 1
        `).bind(actor.tenantId, entryId, appointment.rowVersion + 1, now).first<{ id: string; tokenNumber: number; sequenceNumber: number }>();
        if (committed) created = committed;
      } catch (error) {
        lastInsertError = error;
        const replay = await d1.prepare(
          "SELECT id, token_number AS tokenNumber, sequence_number AS sequenceNumber, status FROM queue_entries WHERE tenant_id = ? AND appointment_id = ? LIMIT 1",
        ).bind(actor.tenantId, id).first<{ id: string; tokenNumber: number; sequenceNumber: number; status: string }>();
        if (replay) return Response.json({ queueEntry: replay, replayed: true });
      }
    }

    if (!created) {
      if (lastInsertError) throw lastInsertError;
      return Response.json({ error: "The appointment changed while check-in was being saved. Refresh and try again." }, { status: 409 });
    }
    if (!queue) return Response.json({ error: "Today’s queue is no longer available." }, { status: 409 });

    const queueRows = await d1.prepare(`
      SELECT id, status, sequence_number AS sequenceNumber,
        estimated_duration_seconds AS estimatedDurationSeconds, started_at_ms AS startedAt
      FROM queue_entries WHERE tenant_id = ? AND queue_id = ?
    `).bind(actor.tenantId, queue.id).all<{
      id: string;
      status: WaitEntry["status"];
      sequenceNumber: number;
      estimatedDurationSeconds: number;
      startedAt: number | null;
    }>();
    const estimates = estimateQueue(queueRows.results, now);
    if (estimates.length) {
      await d1.batch(estimates.map((estimate) => d1.prepare(
        "UPDATE queue_entries SET estimated_start_at_ms = ?, estimated_wait_seconds = ? WHERE tenant_id = ? AND queue_id = ? AND id = ?",
      ).bind(estimate.estimatedStartAt, estimate.estimatedWaitSeconds, actor.tenantId, queue.id, estimate.id)));
    }

    const pending = queueRows.results
      .filter((entry) => entry.status === "CALLED" || entry.status === "WAITING")
      .sort((a, b) => {
        if (a.status === "CALLED" && b.status !== "CALLED") return -1;
        if (b.status === "CALLED" && a.status !== "CALLED") return 1;
        return a.sequenceNumber - b.sequenceNumber || a.id.localeCompare(b.id);
      });
    const activeCount = queueRows.results.filter((entry) => entry.status === "IN_CONSULTATION").length;
    const pendingIndex = pending.findIndex((entry) => entry.id === created!.id);
    const estimate = estimates.find((item) => item.id === created.id);

    return Response.json({
      queueEntry: {
        ...created,
        status: "WAITING",
        estimatedWaitSeconds: estimate?.estimatedWaitSeconds ?? 0,
        patientsAhead: pendingIndex < 0 ? null : activeCount + pendingIndex,
      },
      replayed: false,
    }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to check in patient");
  }
}
