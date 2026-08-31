import { localDateInIndia } from "./clinic-context";

export type ActionCenterItem = {
  id: string;
  category: "PATIENT_FLOW" | "FOLLOW_UP" | "BILLING" | "INVENTORY" | "SCHEDULE";
  severity: "NOW" | "TODAY" | "WATCH";
  title: string;
  why: string;
  actionLabel: string;
  href: string;
  count: number;
};

export type OperationalFacts = {
  date: string;
  waitingPatients: number;
  inConsultation: number;
  overdueFollowUps: number;
  dueFollowUps: number;
  unpaidInvoices: number;
  outstandingPaise: number;
  unbilledEncounters: number;
  lowStockProducts: number;
  nearExpiryProducts: number;
  cancellations: number;
  noShows: number;
};

export async function loadActionCenter(d1: D1Database, tenantId: string, locationId: string) {
  const date = localDateInIndia();
  const factsRow = await d1.prepare(`
    SELECT
      (SELECT COUNT(*) FROM queue_entries qe JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
        WHERE qe.tenant_id = ? AND q.location_id = ? AND q.service_date_local = ? AND qe.status IN ('WAITING','CALLED')) AS waitingPatients,
      (SELECT COUNT(*) FROM queue_entries qe JOIN queues q ON q.tenant_id = qe.tenant_id AND q.id = qe.queue_id
        WHERE qe.tenant_id = ? AND q.location_id = ? AND q.service_date_local = ? AND qe.status = 'IN_CONSULTATION') AS inConsultation,
      (SELECT COUNT(*) FROM follow_ups WHERE tenant_id = ? AND status = 'OVERDUE') AS overdueFollowUps,
      (SELECT COUNT(*) FROM follow_ups WHERE tenant_id = ? AND (status = 'DUE' OR (status = 'UPCOMING' AND due_local_date <= ?))) AS dueFollowUps,
      (SELECT COUNT(*) FROM invoices WHERE tenant_id = ? AND status IN ('ISSUED','PARTIALLY_PAID') AND balance_paise > 0) AS unpaidInvoices,
      (SELECT COALESCE(SUM(balance_paise),0) FROM invoices WHERE tenant_id = ? AND status IN ('ISSUED','PARTIALLY_PAID')) AS outstandingPaise,
      (SELECT COUNT(*) FROM appointments a LEFT JOIN invoices i ON i.tenant_id = a.tenant_id AND i.appointment_id = a.id AND i.status <> 'VOID'
        WHERE a.tenant_id = ? AND a.location_id = ? AND a.status = 'COMPLETED' AND i.id IS NULL) AS unbilledEncounters,
      (SELECT COUNT(*) FROM (
        SELECT p.id FROM inventory_products p
        LEFT JOIN inventory_batches b ON b.tenant_id = p.tenant_id AND b.product_id = p.id
        WHERE p.tenant_id = ? AND p.active = 1
        GROUP BY p.tenant_id, p.id, p.reorder_level
        HAVING COALESCE(SUM(b.quantity_on_hand), 0) <= p.reorder_level
      )) AS lowStockProducts,
      (SELECT COUNT(DISTINCT p.id) FROM inventory_products p JOIN inventory_batches b ON b.tenant_id = p.tenant_id AND b.product_id = p.id
        WHERE p.tenant_id = ? AND b.quantity_on_hand > 0 AND b.expiry_date BETWEEN ? AND date(?, '+60 day')) AS nearExpiryProducts,
      (SELECT COUNT(*) FROM appointments WHERE tenant_id = ? AND location_id = ? AND status = 'CANCELLED' AND date(cancelled_at_ms/1000,'unixepoch','+5 hours','+30 minutes') = ?) AS cancellations,
      (SELECT COUNT(*) FROM appointments WHERE tenant_id = ? AND location_id = ? AND status = 'NO_SHOW' AND date(scheduled_at_ms/1000,'unixepoch','+5 hours','+30 minutes') = ?) AS noShows
  `).bind(
    tenantId, locationId, date,
    tenantId, locationId, date,
    tenantId,
    tenantId, date,
    tenantId,
    tenantId,
    tenantId, locationId,
    tenantId,
    tenantId, date, date,
    tenantId, locationId, date,
    tenantId, locationId, date,
  ).first<Record<string, number | null>>();

  const facts: OperationalFacts = {
    date,
    waitingPatients: Number(factsRow?.waitingPatients ?? 0),
    inConsultation: Number(factsRow?.inConsultation ?? 0),
    overdueFollowUps: Number(factsRow?.overdueFollowUps ?? 0),
    dueFollowUps: Number(factsRow?.dueFollowUps ?? 0),
    unpaidInvoices: Number(factsRow?.unpaidInvoices ?? 0),
    outstandingPaise: Number(factsRow?.outstandingPaise ?? 0),
    unbilledEncounters: Number(factsRow?.unbilledEncounters ?? 0),
    lowStockProducts: Number(factsRow?.lowStockProducts ?? 0),
    nearExpiryProducts: Number(factsRow?.nearExpiryProducts ?? 0),
    cancellations: Number(factsRow?.cancellations ?? 0),
    noShows: Number(factsRow?.noShows ?? 0),
  };

  const items: ActionCenterItem[] = [];
  if (facts.waitingPatients) items.push({ id: "queue", category: "PATIENT_FLOW", severity: "NOW", title: `${facts.waitingPatients} patient${facts.waitingPatients === 1 ? "" : "s"} waiting`, why: "Patients are checked in and need the next queue action.", actionLabel: "Open queue", href: "/queue", count: facts.waitingPatients });
  if (facts.unbilledEncounters) items.push({ id: "unbilled", category: "BILLING", severity: "TODAY", title: `${facts.unbilledEncounters} completed encounter${facts.unbilledEncounters === 1 ? "" : "s"} need billing`, why: "The consultation is complete but no active invoice exists.", actionLabel: "Create bills", href: "/billing", count: facts.unbilledEncounters });
  if (facts.unpaidInvoices) items.push({ id: "outstanding", category: "BILLING", severity: "TODAY", title: `${facts.unpaidInvoices} invoice${facts.unpaidInvoices === 1 ? "" : "s"} outstanding`, why: `₹${(facts.outstandingPaise / 100).toLocaleString("en-IN")} remains unreconciled.`, actionLabel: "Review balances", href: "/billing", count: facts.unpaidInvoices });
  if (facts.overdueFollowUps || facts.dueFollowUps) items.push({ id: "followups", category: "FOLLOW_UP", severity: facts.overdueFollowUps ? "TODAY" : "WATCH", title: `${facts.overdueFollowUps + facts.dueFollowUps} follow-up${facts.overdueFollowUps + facts.dueFollowUps === 1 ? "" : "s"} need attention`, why: `${facts.overdueFollowUps} overdue and ${facts.dueFollowUps} due from the clinic record.`, actionLabel: "Open follow-ups", href: "/follow-ups", count: facts.overdueFollowUps + facts.dueFollowUps });
  if (facts.lowStockProducts) items.push({ id: "low-stock", category: "INVENTORY", severity: "TODAY", title: `${facts.lowStockProducts} product${facts.lowStockProducts === 1 ? "" : "s"} at or below reorder level`, why: "Recorded stock is at the configured attention threshold.", actionLabel: "Review stock", href: "/inventory", count: facts.lowStockProducts });
  if (facts.nearExpiryProducts) items.push({ id: "expiry", category: "INVENTORY", severity: "WATCH", title: `${facts.nearExpiryProducts} product${facts.nearExpiryProducts === 1 ? "" : "s"} near expiry`, why: "At least one in-stock batch expires within 60 days.", actionLabel: "Review batches", href: "/inventory", count: facts.nearExpiryProducts });
  if (facts.cancellations || facts.noShows) items.push({ id: "recovery", category: "SCHEDULE", severity: "WATCH", title: `${facts.cancellations + facts.noShows} recovery opportunit${facts.cancellations + facts.noShows === 1 ? "y" : "ies"}`, why: `${facts.cancellations} cancellation and ${facts.noShows} no-show today. Slot matching is not automated yet.`, actionLabel: "Review schedule", href: "/appointments", count: facts.cancellations + facts.noShows });

  return { facts, items };
}
