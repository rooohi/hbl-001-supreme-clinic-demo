# Twacha Clinic OS

Twacha Clinic OS is a private, owner-only product preview for Twacha Skin • Hair • Laser • Cosmetology Centre. It demonstrates an end-to-end clinic workflow on a Cloudflare-oriented Next.js stack. It is not approved for public access, real patient data, or unsupervised clinical use.

## Release status

**Private preview only — not clinic-ready.** The repository builds and its core development checks pass, but there is no verified live release URL and the public-launch gates below remain open. Keep `NEXT_PUBLIC_ALLOW_INDEXING=false` and place any hosted build behind owner-only access.

## Implemented in the preview

- Staff command center, deterministic action center, activation checklist, appointments, patient search, follow-ups, services, team, messages/configuration states, and operational analytics.
- Conflict-aware public and staff scheduling with server-owned booking attribution, idempotency keys, provider slot claims, staff/public service eligibility, and clinic-hour validation.
- Provider-isolated check-in and queue operation with guarded transitions, deterministic wait estimates, patients-ahead calculations, and optional follow-up creation.
- Clinician-authored consultation drafts, explicit sign/amend actions, structured prescription items, and audit events. These workflows have not received clinical-governance approval.
- Invoice creation, paise-based totals, discounts/tax fields, and manual payment recording for cash, UPI, card, online, or other references. No payment processor is connected.
- Inventory products, batches, receipts, adjustments, low-stock thresholds, expiry signals, stock movements, and audit events. Invoice/product extraction is deliberately unavailable.
- Patient booking with rate limiting and a random, hashed, expiring booking-status capability. The tracking response excludes patient identity and clinical content; verified patient OTP is not implemented.
- An optional aggregate-only AI operations brief behind an explicit configuration gate. The AI provider is not connected by default, and deterministic clinic workflows do not depend on it.

## Explicitly not connected

- WhatsApp, SMS, and email delivery, templates, retries, delivery webhooks, and consent operations.
- Razorpay order creation, Checkout, signed webhooks, refunds, or reconciliation.
- AI inventory extraction or any diagnostic, prescribing, triage, or autonomous clinical AI.
- Private document upload/download through R2.

## Public-launch blockers

1. Verified staff identity mapped to persisted membership, role, location, and provider grants; secure sessions, revocation, MFA for privileged roles, and CSRF protection.
2. Verified patient OTP and family/dependent authority for patient-facing identity flows.
3. Tenant-keyed envelope encryption for PII and clinical text, managed key rotation, blind indexes, and composite tenant foreign keys or equivalent database-enforced isolation.
4. Provider credentials, signed webhook ingestion, idempotent outbox/retry workers, reconciliation, consent policy, and production operations for communications and payments.
5. Clinical-governance review of notes, prescriptions, signing/amendment, safety copy, retention, and audit access.
6. Removal of development fixtures and verification of real clinic address, phone, staff identities, services, policies, and consent copy.
7. Backups, restore drills, disaster recovery, structured observability, alerting, incident response, rate-limit operations, dependency/secret scanning, and load testing.
8. Full authorization, cross-tenant, concurrency, integration, end-to-end, accessibility, and recovery testing.

No HIPAA, DPDP, ISO, SOC, medical-device, or other compliance/certification claim is made.

## Local development

Requirements: Node.js 22.13 or newer and the repository dependencies.

```bash
npm install
npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
npm run dev
```

Open `http://localhost:3000/` for the staff preview and `http://localhost:3000/book` for the patient booking flow. Apply `db/seeds/development.sql` only to a disposable local database if development fixtures are required.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm test
```

`npm test` performs a production `vinext` build and then runs the Node core tests. See `TEST_REPORT.md` for the current evidence and limitations.

## Documentation

- `PRODUCT_AUDIT.md` — evidence-led product audit and execution priorities
- `PRODUCT_SPEC.md` — implemented product surface and boundaries
- `ARCHITECTURE.md` and `DATABASE.md` — application and persistence design
- `SECURITY.md`, `PRIVACY_ARCHITECTURE.md`, and `DATA_RETENTION.md` — draft controls and remaining work
- `TESTING.md` and `TEST_REPORT.md` — test strategy and current verification snapshot
- `AI_DIFFERENTIATION.md` and `AI_ROADMAP.md` — bounded AI position and staged plan
- `WHATSAPP_SETUP.md` and `RAZORPAY_SETUP.md` — provider-readiness runbooks; neither integration is connected
- `DEPLOYMENT.md` — owner-only release policy
