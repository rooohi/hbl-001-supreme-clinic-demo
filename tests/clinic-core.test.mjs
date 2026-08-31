import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { estimateQueue, estimateQueues, queuePositions } from "../server/wait-time.mjs";

test("queue estimates put called patients first and remain deterministic", () => {
  const now = 1_000_000;
  const estimates = estimateQueue([
    { id: "waiting-1", status: "WAITING", sequenceNumber: 1, estimatedDurationSeconds: 1_200, startedAt: null },
    { id: "called-2", status: "CALLED", sequenceNumber: 2, estimatedDurationSeconds: 900, startedAt: null },
  ], now);

  assert.deepEqual(estimates.map((item) => item.id), ["called-2", "waiting-1"]);
  assert.deepEqual(estimates.map((item) => item.estimatedWaitSeconds), [0, 900]);
});

test("active consultations contribute their remaining duration with a five-minute floor", () => {
  const now = 2_000_000;
  const estimates = estimateQueue([
    { id: "active", status: "IN_CONSULTATION", sequenceNumber: 1, estimatedDurationSeconds: 1_200, startedAt: now - 1_100_000 },
    { id: "next", status: "WAITING", sequenceNumber: 2, estimatedDurationSeconds: 60, startedAt: null },
    { id: "after", status: "WAITING", sequenceNumber: 3, estimatedDurationSeconds: 99_999, startedAt: null },
  ], now);

  assert.equal(estimates[0].estimatedWaitSeconds, 300);
  assert.equal(estimates[1].estimatedWaitSeconds, 600);
});

test("provider queues keep estimates and patients-ahead counts isolated", () => {
  const now = 5_000_000;
  const entries = [
    { id: "provider-a-active", queueId: "provider-a", status: "IN_CONSULTATION", sequenceNumber: 1, estimatedDurationSeconds: 1_200, startedAt: now },
    { id: "provider-a-next", queueId: "provider-a", status: "WAITING", sequenceNumber: 2, estimatedDurationSeconds: 900, startedAt: null },
    { id: "provider-b-next", queueId: "provider-b", status: "WAITING", sequenceNumber: 1, estimatedDurationSeconds: 600, startedAt: null },
  ];

  const estimates = new Map(estimateQueues(entries, now).map((item) => [item.id, item]));
  assert.equal(estimates.get("provider-a-next").estimatedWaitSeconds, 1_200);
  assert.equal(estimates.get("provider-b-next").estimatedWaitSeconds, 0);

  const positions = new Map(queuePositions(entries).map((item) => [item.id, item.patientsAhead]));
  assert.equal(positions.get("provider-a-next"), 1);
  assert.equal(positions.get("provider-b-next"), 0);
});

test("schema migrations retain tenant and double-booking guards", async () => {
  const migration = await readFile(new URL("../drizzle/0000_boring_silk_fever.sql", import.meta.url), "utf8");
  assert.match(migration, /PRIMARY KEY\(`tenant_id`, `provider_id`, `bucket_start_ms`\)/);
  assert.match(migration, /CREATE UNIQUE INDEX `uq_appointments_idempotency`/);
  assert.match(migration, /`tenant_id` text NOT NULL/);
  assert.match(migration, /CREATE TABLE `audit_logs`/);
});

test("public scheduling revalidates eligibility, hours, and aligned slot starts", async () => {
  const source = await readFile(new URL("../server/scheduling.ts", import.meta.url), "utf8");
  assert.match(source, /booking_mode = 'PUBLIC'/);
  assert.match(source, /minute % 20/);
  assert.match(source, /11:00 AM to 6:00 PM/);
  assert.match(source, /provider_slot_claims/);
});

test("appointment source is derived from the authenticated booking channel", async () => {
  const source = await readFile(new URL("../server/scheduling.ts", import.meta.url), "utf8");
  assert.match(source, /options\.actorType === "PATIENT" \? "PUBLIC_WEB" : "STAFF"/);
  assert.doesNotMatch(source, /input\.source/);
});

test("staff-only services and availability require an explicit staff audience", async () => {
  const servicesRoute = await readFile(new URL("../app/api/services/route.ts", import.meta.url), "utf8");
  const availabilityRoute = await readFile(new URL("../app/api/public/availability/route.ts", import.meta.url), "utf8");
  const form = await readFile(new URL("../features/appointments/appointment-form.tsx", import.meta.url), "utf8");
  assert.match(servicesRoute, /booking_mode = 'PUBLIC'/);
  assert.match(servicesRoute, /requireStaff\(request, "appointments\.read"\)/);
  assert.match(availabilityRoute, /\? = 'staff' OR booking_mode = 'PUBLIC'/);
  assert.match(form, /publicMode \? "public" : "staff"/);
});
