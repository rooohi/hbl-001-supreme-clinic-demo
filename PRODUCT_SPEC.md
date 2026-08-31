# Product specification

## Release definition

Twacha Clinic OS is an owner-only private preview of a clinic operations system for Twacha Skin • Hair • Laser • Cosmetology Centre. It demonstrates connected workflows from booking through consultation, checkout, stock, and return care. It is not a production EMR, patient portal, payment system, messaging system, or autonomous clinical product.

The current clinic configuration assumes Asia/Kolkata, Monday–Saturday, 11:00 AM–6:00 PM, and Dr. Suman Odugoudar Dibbad as the primary provider. Real clinic details must be verified before any launch.

## Product promise

Reduce administrative handoffs while keeping operational arithmetic deterministic, clinical decisions explicit, and incomplete integrations visible. No feature may silently simulate a sent message, completed payment, AI result, or clinical approval.

## Primary users

- Receptionist: find or create patients, book appointments, check in, operate the queue, manage follow-ups, issue invoices, and record an externally completed payment.
- Doctor: view assigned encounters, start and complete consultations, write/sign/amend notes, create prescriptions, and choose follow-up timing.
- Clinic owner: review the command/action centers, services, staff, activation blockers, operational metrics, billing state, and stock attention items.
- Patient or authorized family member: select a publicly eligible service, book a free slot, and use a private capability link to view minimized booking/queue status.

## Implemented surfaces

| Area | Current capability | Release boundary |
|---|---|---|
| Command center | Daily appointments, queue, follow-ups, operational metrics | Development data may be seeded; metrics are not business forecasts |
| Action center | Deterministic priorities from queue, follow-up, billing, inventory, cancellation, and no-show facts | Not AI; does not auto-execute work |
| Activation | Shows missing clinic, identity, privacy, provider, demo-data, and integration prerequisites | Never grants public-launch approval |
| Scheduling | Public/staff service separation, live slot calculation, idempotency, slot claims, server-derived source | No full reschedule, holiday calendar, multi-room, or waitlist offer engine |
| Queue | Provider-isolated tokens, guarded transitions, current wait estimate, patients ahead | Estimate is operational arithmetic, not a promise |
| Patients | Tenant-scoped search and basic profile records | No verified patient identity, family authority, export/deletion workflow, or complete timeline |
| Consultations | Draft, sign, and amend clinical note; structured medication items and prescription state | No clinical-governance approval, signature certificate, formulary/interactions, or document workflow |
| Follow-ups | Due/overdue worklist, explicit intervals, and linked rebooking | No automated outreach or clinical inference |
| Billing | Draft/issue invoice, paise-based line calculations, balances, manual payment records | No Razorpay, tax/legal validation, refund workflow, or accounting export |
| Inventory | Products, batches, receipts, adjustments, low-stock and expiry signals, movement ledger | No procurement, dispensing validation, barcode hardware, or AI extraction |
| Patient booking | Public services, availability, consent record, rate limit, booking confirmation | Contact ownership is not OTP verified |
| Patient tracking | Random 256-bit capability stored only as a hash, expiry, revocation field, no-store response, minimized payload | Not a patient login; capability delivery/recovery and OTP are absent |
| Communications | Templates/configuration/readiness states | WhatsApp/SMS/email delivery and webhooks are not connected |
| AI brief | Optional structured brief from aggregate operational facts only | Provider not connected by default; human review required; no patient or clinical autonomy |

## Core journeys

### Booking to queue

1. The patient or staff member selects a service and date.
2. The server rechecks audience eligibility, hours, booking horizon, slot alignment, and provider claims.
3. A successful public booking records consent and returns a one-time-disclosed tracking capability; the database stores its hash.
4. Staff check-in allocates a token inside the appointment's provider queue and recalculates that queue only.
5. Staff call, start, skip, return, no-show, or complete through guarded state transitions.

### Consultation to return care

1. The doctor works only with assigned appointment records.
2. Notes and medication items remain drafts until an explicit sign action; a later change uses amend rather than silently replacing a signed state.
3. Completion may create an explicitly selected follow-up interval.
4. Due or overdue follow-ups can be rebooked and linked to the source work item.

### Checkout and stock

1. A completed encounter becomes eligible for an invoice.
2. The server calculates subtotal, tax, discount, total, paid, and balance in paise.
3. Staff may record a payment that happened outside the product; this does not initiate or verify a processor payment.
4. Stock receipts and adjustments update batches and append movement/audit records. Invoice extraction remains a visible `NOT_CONNECTED` state.

## Product rules

- Database uniqueness, not availability UI alone, rejects double-booking.
- Actor context determines booking source; client JSON cannot relabel it.
- Public services and staff-only services remain separate at catalog, availability, and create time.
- Queue position and wait are isolated by provider queue.
- Clinical notes, prescriptions, follow-ups, payments, messages, and AI recommendations require explicit human action or review.
- Public tracking never returns patient name, contact details, or clinical content.
- Recovery values are operational opportunities, never guaranteed revenue.
- Missing providers must produce `NOT_CONNECTED` or an error, never synthetic success.

## AI boundary

The deterministic action center is the primary assistance layer. The optional AI gateway may receive only aggregate operational facts and must return schema-validated administrative priorities with uncertainty. It may not receive clinical notes or contact data in the current design and may never diagnose, prescribe, triage serious symptoms, or finalize any action. See `AI_DIFFERENTIATION.md` and `AI_ROADMAP.md`.

## Release acceptance

The current build is acceptable only for private owner evaluation when:

- access is owner-only and `NEXT_PUBLIC_ALLOW_INDEXING=false`;
- the database contains synthetic/development data only;
- messaging, payment, extraction, and AI states remain visibly disconnected unless separately verified;
- no user treats the preview as a source of clinical, payment-provider, or compliance truth.

## Public-launch gates

Public or real-patient use is blocked until verified staff identity and patient OTP, tenant-keyed encryption and composite database isolation, provider credential/webhook operations, clinical governance, production fixture removal, backups/DR/observability, and full security/integration/accessibility testing are complete and approved.
