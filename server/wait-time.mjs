/**
 * Deterministically estimates queue start times. This is operational arithmetic,
 * not an AI prediction.
 *
 * @param {Array<{id:string,status:string,sequenceNumber:number,estimatedDurationSeconds:number,startedAt:number|null}>} entries
 * @param {number} now
 */
export function estimateQueue(entries, now = Date.now()) {
  const active = entries.find((entry) => entry.status === "IN_CONSULTATION");
  let cursor = now;

  if (active) {
    const elapsed = active.startedAt ? Math.max(0, now - active.startedAt) / 1000 : 0;
    cursor += Math.max(300, active.estimatedDurationSeconds - elapsed) * 1000;
  }

  const pending = entries
    .filter((entry) => entry.status === "CALLED" || entry.status === "WAITING")
    .sort((a, b) => {
      if (a.status === "CALLED" && b.status !== "CALLED") return -1;
      if (b.status === "CALLED" && a.status !== "CALLED") return 1;
      return a.sequenceNumber - b.sequenceNumber || a.id.localeCompare(b.id);
    });

  return pending.map((entry) => {
    const estimate = {
      id: entry.id,
      estimatedStartAt: Math.round(cursor),
      estimatedWaitSeconds: Math.max(0, Math.round((cursor - now) / 1000)),
    };
    cursor += Math.max(300, Math.min(14_400, entry.estimatedDurationSeconds)) * 1000;
    return estimate;
  });
}

/**
 * Estimates each provider queue independently. Queue ids are deliberately part
 * of the grouping key so one provider's active consultation never delays a
 * different provider's patients.
 *
 * @param {Array<{id:string,queueId?:string,status:string,sequenceNumber:number,estimatedDurationSeconds:number,startedAt:number|null}>} entries
 * @param {number} now
 */
export function estimateQueues(entries, now = Date.now()) {
  const groups = new Map();
  for (const entry of entries) {
    const queueId = entry.queueId ?? "__single_queue__";
    const group = groups.get(queueId) ?? [];
    group.push(entry);
    groups.set(queueId, group);
  }

  return Array.from(groups.values()).flatMap((group) => estimateQueue(group, now));
}

/**
 * Returns the number of live patients ahead of every called/waiting entry.
 * Active consultations count as one patient ahead. Results are isolated by
 * queue id for the same reason as estimates.
 *
 * @param {Array<{id:string,queueId?:string,status:string,sequenceNumber:number}>} entries
 */
export function queuePositions(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const queueId = entry.queueId ?? "__single_queue__";
    const group = groups.get(queueId) ?? [];
    group.push(entry);
    groups.set(queueId, group);
  }

  return Array.from(groups.values()).flatMap((group) => {
    const activeCount = group.filter((entry) => entry.status === "IN_CONSULTATION").length;
    const pending = group
      .filter((entry) => entry.status === "CALLED" || entry.status === "WAITING")
      .sort((a, b) => {
        if (a.status === "CALLED" && b.status !== "CALLED") return -1;
        if (b.status === "CALLED" && a.status !== "CALLED") return 1;
        return a.sequenceNumber - b.sequenceNumber || a.id.localeCompare(b.id);
      });

    return pending.map((entry, index) => ({ id: entry.id, patientsAhead: activeCount + index }));
  });
}
