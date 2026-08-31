# Privacy architecture

This is an engineering draft aligned to data-minimization and DPDP-oriented principles; it is not legal advice or a compliance attestation.

## Purposes

- care operations: identity/contact, bookings, queue, consultation, follow-up;
- transactional communications: confirmations, reminders, queue updates;
- service improvement: aggregated operational analytics;
- optional marketing/review: separate consent and policy are required.

## Boundaries

- tenant and location scope is derived server-side;
- public queue/status payloads contain tokens/times, not patient names;
- patient lists are limited and searchable rather than downloading the full database;
- audit metadata must be allow-listed and redacted;
- providers receive only the minimum delivery payload;
- files must remain private and authorization checked on every operation.

## Required production controls

- approved notices and purpose-specific consent records;
- verified patient/family authority and correction/export/deletion request workflow;
- envelope encryption and key rotation;
- access logging for patient/clinical/file/export actions;
- processor/vendor review, data-flow inventory, incident response, and breach procedures;
- retention/deletion jobs with legal-hold support and evidence;
- aggregate/de-identify analytics where possible.

The current preview demonstrates consent recording and minimized tracking responses, but does not yet implement all controls above.
