# Test report

**Snapshot:** 2026-08-31

**Release candidate:** Twacha Clinic OS private preview
**Verdict:** **PASS for owner-only evaluation; NO-GO for public or real-patient use**

## Executive result

The application compiles, builds, passes its current seven core tests, and served the checked local API/visual flows. The evidence is enough to continue private product evaluation with synthetic data. It is not enough to establish production security, clinical safety, tenant isolation, provider integration, accessibility conformance, or operational recovery.

There is no verified live deployment URL in this report. The release posture is owner-only/private-preview-only, `NEXT_PUBLIC_ALLOW_INDEXING=false`, and not clinic-ready.

## Verified checks

| Check | Result | Evidence/meaning |
|---|---|---|
| TypeScript | Pass | `npx tsc --noEmit` completed without errors |
| Scoped lint | Pass | Scheduling, appointment, queue, service, availability, and form changes passed ESLint |
| Production build | Pass | `npm run build` completed with `vinext build` and emitted staff, patient, and API routes |
| Core Node tests | 7/7 pass | Queue arithmetic/isolation, schema guards, scheduling validation, source attribution, and audience eligibility |
| SQL preparation | 26/26 pass | Queue/check-in/cancellation prepared SQL parsed against the current SQLite schema |
| Public/staff services | Pass | Local reference data returned 4 public and 6 staff services |
| Service eligibility | Pass | Staff-only service availability returned `404` to public and slots to staff for the checked date |
| Provider isolation | Pass | Doctor request for a foreign provider queue returned `403` |
| Queue payload | Pass | Checked response included provider identity and patients-ahead data |
| Visual evidence | Reviewed | Desktop/mobile captures stored in `audits/2026-08-31/` |

The route-count and service-count observations are fixture-dependent. They show that the checked branches behaved as designed; they are not expected production values.

## Visual evidence set

- `01-follow-ups-desktop.jpg`
- `02-command-center-desktop.jpg`
- `03-appointments-desktop.jpg`
- `04-patients-desktop.jpg`
- `05-booking-mobile.jpg`
- `06-booking-form-mobile.jpg`
- `07-queue-desktop.jpg`
- `08-settings-desktop.jpg`

These captures support a product/design review only. They are not a formal WCAG audit and do not cover every state or newly added clinical/commerce surface.

## Code-reviewed safeguards

- Public booking revalidates service eligibility and slot claims server-side.
- Booking source is derived from authenticated channel context rather than client input.
- Public booking creates a random capability whose hash, purpose, expiry, use, and revocation fields are stored; the status payload omits identity and clinical content.
- Public booking/status routes apply a persistent windowed rate counter and no-store response headers.
- Queue reads/actions and recalculation are isolated to provider queues, with row-version/state guards.
- AI operational brief generation is unavailable without explicit provider configuration, accepts aggregate operational facts, validates structured output, and records an audit event.
- Inventory extraction returns an explicit `503 NOT_CONNECTED` response.

These are implementation observations, not penetration-test or compliance conclusions.

## Not verified in this release

- Production staff identity, session, role/location/provider grants, MFA, CSRF, revocation, and exhaustive authorization.
- Patient OTP, family/dependent authority, capability delivery/recovery, or compromised-link response.
- Tenant-keyed PII/clinical encryption, managed keys/rotation, composite tenant foreign keys, cross-tenant negative testing, retention, export, or deletion.
- Clinical-governance approval of note/prescription content, signing/amendment semantics, medication safety, print/legal format, or audit review.
- Razorpay orders, Checkout, webhook signatures, duplicate events, settlement, refunds, or reconciliation.
- WhatsApp/SMS/email template approval, consent, send, retry, webhook verification, delivery receipts, or suppression.
- R2 file authorization, malware scanning, signed operations, or lifecycle policy.
- Full integration/E2E/concurrency suites for clinical, billing, payment, inventory, messaging, and AI flows.
- Formal accessibility, browser compatibility, mobile-device, performance, load, security, or privacy testing.
- Structured production observability, alerting, backup integrity, point-in-time recovery, restore drill, disaster recovery, RPO, or RTO.

## Release decision

### Allowed

- Owner-only/private evaluation behind real access control.
- Synthetic data only.
- Product walkthroughs that label disconnected and unapproved workflows accurately.
- Continued implementation and repeatable test development.

### Prohibited

- Public indexing or an unauthenticated staff surface.
- Real patient, clinical, payment-credential, or provider-production data.
- Claiming messages were sent, Razorpay payments were collected, AI was connected, or clinical records were approved.
- Clinic-live, compliance, certification, security, or medical-safety claims.

## Exit criteria for a public candidate

Close and independently verify every blocker covering staff/patient identity, tenant isolation/encryption, provider credentials/webhooks, clinical governance, fixture removal, backups/DR/observability, and comprehensive testing. A named human security/privacy/clinical/release approver must then issue a new release decision; this report cannot be reused as that approval.
