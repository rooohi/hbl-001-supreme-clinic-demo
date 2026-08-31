# WhatsApp setup runbook

## Current status

**Not connected.** The application currently stores message templates/configuration states but has no WhatsApp sender, delivery worker, signed webhook endpoint, template synchronization, retry/dead-letter processing, or consent/suppression enforcement. `WHATSAPP_PROVIDER_TOKEN` is read only as an activation-readiness signal; setting it does not make messaging functional.

Do not tell patients that a confirmation or reminder was sent from this release.

## Intended initial scope

Start with approved transactional messages only:

- appointment confirmation, reschedule, and cancellation;
- reminder with clinic-approved timing;
- queue delay/ready message;
- clinician-selected follow-up reminder.

Marketing, reviews, promotional offers, free-form clinical advice, diagnostic content, reports, prescriptions, and patient-initiated generative chat are out of scope for the first release.

## Prerequisites

1. Select Meta WhatsApp Cloud API or an approved Business Solution Provider and complete vendor/privacy review.
2. Complete business verification, WhatsApp Business Account and sender-number setup, display-name approval, and production access.
3. Approve the clinic's real legal/contact details, privacy notice, consent/opt-out policy, escalation channel, and message retention policy.
4. Create and approve templates for each event, locale, and purpose. Keep care details minimal.
5. Define operating owners for failed messages, patient replies, opt-outs, provider incidents, credential rotation, and reconciliation.
6. Implement the application adapter, outbox worker, webhook inbox, signature verification, idempotency, retries, dead-letter handling, observability, and support UI. These components do not exist yet.

## Secret/configuration design

Keep all credentials server-side in the deployment secret manager. Never commit them, expose them through `NEXT_PUBLIC_*`, log them, or paste them into support tickets.

The current placeholder is:

```text
WHATSAPP_PROVIDER_TOKEN=
```

A production adapter will normally also need provider-specific values such as business account ID, phone-number ID/sender ID, API version, app secret/signing key, webhook verify token, and possibly provider base URL. Add exact names only when the adapter exists and document which values are credentials versus public identifiers.

`AUTH_SECRET` must also be a strong production secret because the preview rate-limit key derivation falls back to it. Do not use the development fallback in production.

## Required application flow

1. A clinic workflow creates an allow-listed message intent with tenant, patient, appointment, purpose, locale, template key, idempotency key, and consent basis.
2. An outbox worker renders only approved parameters, checks consent/suppression immediately before send, and calls the provider with a stable idempotency/correlation key.
3. The provider response records its message ID and a non-final submitted/sent state.
4. A public HTTPS webhook verifies the raw-body signature before parsing, stores each provider event once, and updates delivery state monotonically.
5. Retriable failures use bounded backoff and a dead-letter queue; permanent failures become staff work items.
6. Replies and opt-outs follow the approved routing/suppression policy. No model responds automatically.

The database `messages` table is a starting model, not a complete operational outbox/inbox implementation.

## Privacy and clinical safety

- Send the minimum necessary data; prefer date/time, clinic identity, and a secure link over symptoms, diagnoses, medications, or report content.
- Never place tokens, credentials, clinical notes, message bodies, or full phone numbers in logs/audit metadata.
- Enforce purpose-specific consent and opt-out rules before every send.
- Verify family/dependent authority before exposing any care detail to a shared number.
- Use fixed clinician/legal-approved safety copy for emergency or clinical requests; do not generate advice.
- Define deletion and retention separately for application records and provider-held message data.

## Webhook security checklist

- Dedicated HTTPS endpoint with provider signature verification over the raw request body.
- Timestamp/replay window, constant-time comparison, body-size limits, content-type checks, rate limits, and denial logging.
- Idempotency keyed by provider event/message ID.
- Tenant/sender mapping derived server-side, never trusted from a patient-controlled field.
- No state transition from an unverified webhook.
- Secret rotation procedure supporting overlap where the provider permits it.
- Metrics/alerts for signature failures, lag, retry volume, dead letters, delivery failure, and consent suppression.

## Sandbox/controlled verification

Before any production patient number:

1. Use provider test recipients and fictional bookings only.
2. Verify each approved template and locale with missing/oversized parameter cases.
3. Exercise duplicate, out-of-order, delayed, invalid-signature, and replayed webhooks.
4. Simulate rate limits, provider timeout/outage, expired token, revoked sender, and template rejection.
5. Confirm that UI states distinguish queued, submitted, delivered, failed, suppressed, and unknown.
6. Confirm opt-out suppression, retry bounds, dead-letter ownership, redacted logs, and audit correlation.
7. Run accessibility and mobile review of staff error/recovery states.

## Go-live gate

WhatsApp remains blocked until the adapter and webhook code exist, production credentials are stored safely, templates/consent/vendor/privacy review are approved, end-to-end tests pass, monitoring/on-call and rollback are rehearsed, and a named owner authorizes the sender. Presence of `WHATSAPP_PROVIDER_TOKEN` alone is never sufficient.
