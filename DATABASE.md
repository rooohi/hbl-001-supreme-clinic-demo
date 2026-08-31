# Database

## Current persistence

The preview uses Cloudflare D1 (SQLite) through prepared statements and Drizzle schema definitions in `db/schema.ts`. SQL migrations live in `drizzle/`. UUIDs identify most records, money is stored in paise, timestamps are epoch milliseconds, local service dates use `YYYY-MM-DD`, and clinic scheduling uses `Asia/Kolkata`.

This is a private-preview data model, not an approved production healthcare datastore. PII and clinical text are currently plaintext, and many tenant-owned relationships are scoped in application queries rather than enforced with composite `(tenant_id, id)` foreign keys.

## Migration inventory

- `0000_boring_silk_fever.sql` — core tenant, staff/RBAC, scheduling, patient, queue, follow-up, messaging, consent, and audit tables.
- `0001_seed_twacha.sql` — production-safe reference/bootstrap rows only: placeholder clinic/location/staff, roles, services, and message templates. All placeholders must still be replaced and approved.
- `0002_seed_slot_claims.sql` — slot-claim backfill/support for existing reservations.
- `0003_repair_queue_counters.sql` — recalculates queue counters from stored entries.
- `0004_clinical_commerce.sql` — prescriptions, invoice items/payments, inventory batches, and stock movements.
- `0005_patient_access.sql` — hashed booking-status capabilities and public route rate-limit counters.

Synthetic patients, appointments, queues, and care-state records live in `db/seeds/development.sql`. That file is for disposable local databases only and must never be applied with `--remote`.

## Data domains

### Tenancy and staff

`tenants`, `locations`, `staff_members`, `roles`, `permissions`, `role_permissions`, and `staff_role_assignments` model the intended access graph. The current request adapter does not yet establish production-grade persisted sessions and grants.

### Scheduling and flow

`services`, `schedule_reservations`, `provider_slot_claims`, `appointments`, `appointment_events`, `queues`, and `queue_entries` support conflict-aware booking and provider-specific flow.

Important constraints include:

- unique tenant/idempotency key for appointments;
- unique tenant/provider/five-minute bucket for slot claims;
- unique tenant/location/provider/local-date queue;
- unique queue token and unique appointment membership in a queue;
- optimistic `row_version` fields on stateful records.

### Patient and care

`patients`, family/relationship records, `consultations`, `prescriptions`, `prescription_items`, `follow_ups`, `waitlist_entries`, `consent_records`, and `patient_access_tokens` hold preview care operations. Public booking capabilities are random values disclosed to the caller, stored only as SHA-256 hashes, scoped to booking status, expiring after 30 days, and revocable in the schema.

These controls reduce direct identifier exposure but do not replace verified patient OTP, family authority, encryption, or an approved access policy.

### Billing and inventory

`invoices`, `invoice_items`, `payments`, `inventory_products`, `inventory_batches`, and `stock_movements` support internal preview bookkeeping. Processor settlement is not represented as authoritative because Razorpay is not connected. Inventory movements are operational records, not validated dispensing or accounting records.

### Messaging, rate limits, and audit

`message_templates` and `messages` reserve an outbox-like model, but no dispatcher or provider webhook operations are connected. `public_rate_limits` stores a salted/hash-derived client key per route/window. `audit_logs` records allow-listed metadata for important mutations; it is not yet append-only, externally retained, or connected to monitoring.

## Current guarantees and limits

The database currently provides useful uniqueness and check constraints, prepared-statement safety, tenant columns, audit/event records, and guarded state changes. It does **not** yet provide all of the following production guarantees:

- composite tenant foreign keys on every tenant-owned relationship;
- row-level security or an equivalent database policy layer;
- tenant-keyed AEAD envelope encryption for PII/clinical fields, blind indexes, key rotation, or cryptographic deletion;
- an append-only, independently retained audit stream;
- a transactionally coupled provider outbox/webhook inbox with retry and reconciliation;
- approved retention/deletion/legal-hold jobs;
- automated backups, point-in-time recovery, off-site copies, restore drills, or disaster-recovery objectives;
- capacity, lock-contention, failure, and corruption testing for the intended workload.

## Local migration workflow

```bash
npm run db:generate
npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
```

If synthetic fixtures are needed, apply `db/seeds/development.sql` separately to a disposable local database. Inspect every generated migration before applying it. Never edit an applied migration; add a forward migration and document rollback or repair steps.

## Production data gate

Before real patient data is permitted:

1. Choose and formally approve the production database architecture and threat model.
2. Add database-enforced composite tenant isolation and automated cross-tenant tests.
3. Implement tenant-keyed envelope encryption, managed key references, rotation, and safe searchable indexes.
4. Provision verified staff/patient identity and propagate immutable subject/tenant/location scope into every query.
5. Separate bootstrap from customer data; remove placeholders and prove that development fixtures cannot be applied remotely.
6. Define retention, export, correction, deletion, legal hold, audit access, and evidence procedures.
7. Establish encrypted backups, restore verification, RPO/RTO targets, disaster recovery, monitoring, and incident drills.
