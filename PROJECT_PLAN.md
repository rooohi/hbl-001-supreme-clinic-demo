# Project plan

## Release definition

This repository delivers a deployment-ready **private vertical-slice preview**, not the completed 24-module production system described in the original brief. It proves the critical operational loop and makes incomplete integrations visible instead of simulating them.

## Completed in this release

1. Twacha brand integration, staff shell, patient booking header, responsive design tokens, and social card.
2. D1 schema and migrations for tenants, locations, staff, roles, services, patients, families, reservations, appointments, queues, consultations, follow-ups, waitlist, messages, consent, and audit.
3. Conflict-safe scheduling through five-minute provider-slot claims and idempotency keys.
4. Dashboard, appointment views, check-in, queue transitions, deterministic wait estimates, consultation completion, optional follow-up, follow-up rebooking, patient search, services, team preview, settings, messages, analytics, booking, and tracking.
5. Error/loading/empty/configuration states, responsive layouts, keyboard command search, and no-op controls removed or explicitly disabled.
6. Local migration verification, API workflow verification, TypeScript, lint, production build, and core tests.
7. Google Drive workspace under `healthcare/twacha-clinic-os`.

## Launch gates

- Replace preview auth with verified staff sessions, persisted membership/RBAC/location grants, session expiry, CSRF strategy, and access tests.
- Add patient OTP and family/dependent authority; use signed, expiring tracking capabilities rather than appointment UUIDs.
- Move canonical production persistence to PostgreSQL or formally approve D1 for the required scale; add composite tenant foreign keys and stronger SQL checks.
- Encrypt PII and clinical text with managed keys and blind indexes; remove development patient fixtures from production migrations.
- Implement private file upload/download through R2 with authorization, malware scanning, signed URLs, and audit.
- Configure WhatsApp/SMS/email adapters, webhooks, consent policy, retry/outbox workers, and rate limits.
- Implement reschedule, cancellation recovery/waitlist offers, patient timeline, document workspace, complete clinical note/signing workflow, onboarding, multi-doctor scheduling, and Super Admin tenancy.
- Approve clinic address, phone, directions, policies, consent copy, privacy notice, retention schedule, incident response, backup/restore, and observability.
- Add full integration/E2E, tenant-isolation, authorization, concurrency, accessibility, and recovery testing.

## Recommended sequence

1. Identity and tenant isolation hardening.
2. PostgreSQL and encryption migration.
3. Clinical/document boundaries.
4. Communications and patient OTP.
5. Waitlist/recovery and complete calendar operations.
6. Compliance review, observability, performance, accessibility, and launch rehearsal.
