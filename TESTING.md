# Testing strategy

## Release principle

Passing repository checks qualifies this build for private owner evaluation only. It does not establish clinical safety, data-protection compliance, provider settlement, messaging delivery, or public-production readiness.

## Standard checks

```bash
npx tsc --noEmit
npm run lint
npm test
```

`npm test` runs the `vinext` production build before Node tests. The current Node suite covers:

- deterministic queue ordering and duration floors;
- isolation of provider queues and patients-ahead counts;
- core tenant, slot-claim, audit, and appointment-idempotency schema guards;
- server-side public scheduling eligibility, hours, and aligned slot starts;
- server-owned public/staff booking attribution;
- public versus staff service/availability separation.

The suite is intentionally small and partly uses source/migration assertions. It is a regression net, not comprehensive behavioral coverage.

## Current manual and local checks

The 2026-08-31 verification snapshot included:

- production `vinext` build and TypeScript compilation;
- scoped ESLint for the scheduling/queue changes;
- preparation of 26 queue/check-in/cancellation SQL statements against the current SQLite schema;
- local API reads confirming four public versus six staff services in the development reference set;
- staff-only availability rejected for the public audience and returned for the staff audience;
- doctor access to a foreign provider queue rejected with `403`;
- provider id and patients-ahead fields returned from the queue endpoint;
- desktop and mobile visual captures under `audits/2026-08-31/` for command center, appointments, patients, follow-ups, queue, booking, and settings.

Counts above describe the checked development fixture, not production expectations. See `TEST_REPORT.md` for the verdict and exact limitations.

## Required automated layers

### Unit and model tests

- every legal and illegal appointment, queue, consultation, invoice, payment, inventory, follow-up, and access-token transition;
- money rounding, discount/tax bounds, partial-payment concurrency, stock non-negativity, expiry boundaries, and local-time edge cases;
- capability generation, hashing, expiry, revocation, replay behavior, and rate-limit windows;
- AI schema parsing, redaction, refusal, timeout, prompt-injection, and provider-failure behavior without patient data.

### Database-isolated integration tests

- simultaneous booking of the same slot, idempotent replay, cancellation release, and stale row versions;
- simultaneous check-in token allocation and simultaneous queue actions;
- signed-note amendment history, prescription item replacement, invoice uniqueness, payment overrun, and stock adjustment races;
- every cross-tenant, cross-location, and cross-provider relationship, including deliberately mismatched tenant IDs;
- outbox, webhook signature, duplicate delivery, retry, dead-letter, refund, and reconciliation flows once providers exist.

### End-to-end journeys

- verified staff sign-in and permission denial by role/location/provider;
- patient booking, OTP ownership proof, capability delivery, expiry/revocation, and family authority;
- appointment → check-in → queue → consultation → prescription → follow-up → invoice → verified payment;
- message consent, template selection, send, provider webhook, delivery state, suppression, and retry;
- inventory receipt, adjustment, dispensing/sale linkage, and audit review;
- backup restore into an isolated environment and controlled failover.

### Security, privacy, and accessibility

- authentication/session expiry, MFA, CSRF, origin policy, rate-limit abuse, secret scanning, and dependency scanning;
- tenant-keyed encryption, blind-index behavior, key rotation, export, correction, deletion, retention, legal hold, and redacted audit tests;
- authorization on every file, patient, clinical, billing, inventory, and export operation;
- keyboard, screen reader, contrast, 200–400% zoom, reduced motion, touch targets, focus management, and error announcements;
- mobile and desktop responsive checks across supported browsers and slow/error states.

### Reliability and operations

- sustained load, burst booking/check-in, D1 limits, latency budgets, provider outage, webhook backlog, and network retry behavior;
- structured log/trace correlation, alert routing, incident runbooks, synthetic monitoring, backup integrity, restore time, RPO, and RTO;
- release rollback, forward migration repair, feature-disable switches, and credential rotation.

## Test data rules

- Use generated fictional identities only.
- Keep `db/seeds/development.sql` local and disposable.
- Never put real patient contact or clinical data in fixtures, screenshots, logs, bug reports, or AI evaluation sets.
- Redact tokens, provider references, secrets, signed URLs, and message bodies from test evidence.
