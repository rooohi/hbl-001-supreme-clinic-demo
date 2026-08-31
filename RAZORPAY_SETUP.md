# Razorpay setup runbook

## Current status

**Not connected.** Twacha Clinic OS can create internal invoices and record payments that occurred outside the application. It does not create Razorpay orders, open Checkout, verify signatures, ingest webhooks, issue refunds, read settlements, or reconcile provider records.

`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are currently activation-readiness indicators only. Setting them does not activate payments. A manually recorded `ONLINE`, `UPI`, or `CARD` payment is not proof of Razorpay settlement.

## Prerequisites

1. Complete Razorpay account/KYC, legal entity, bank settlement, tax, refund, dispute, and support setup.
2. Obtain separate test and live credentials and store them in the deployment secret manager.
3. Approve invoice numbering, tax calculation, receipt language, cancellation/refund policy, reconciliation ownership, and retention.
4. Implement server-side order creation, client Checkout initialization, signature verification, webhook inbox/idempotency, refund handling, settlement reconciliation, observability, and staff recovery states. These do not exist yet.

## Secrets

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

The key ID may be delivered to the browser only by a purpose-built Checkout response. The key secret and webhook secret must never reach client code, logs, analytics, screenshots, or audit metadata. Use distinct test/live environments and document rotation/revocation.

## Required payment flow

1. Staff issues an internal invoice with an outstanding balance.
2. The server creates a Razorpay order for exactly that balance (or an approved partial amount) in paise, with a stable idempotency/correlation key and minimal metadata.
3. The browser opens Checkout using the server-created order; it never invents amount, currency, invoice, or tenant identity.
4. A client success callback is treated only as “verification pending.” It must not mark an invoice paid.
5. The server verifies the Checkout signature where applicable and a signed HTTPS webhook records authoritative captured/failed/refunded state idempotently.
6. A reconciliation job compares orders, payments, refunds, settlements, fees, and internal balances. Differences become staff work items.

## Webhook and data controls

- Verify the signature over the raw body before parsing; reject invalid, oversized, stale, or replayed events.
- Deduplicate by provider event/payment/refund identifiers and support out-of-order delivery.
- Derive tenant/invoice mapping from a server-created order, not untrusted webhook notes alone.
- Apply monotonic payment states and guarded invoice-balance updates.
- Never store card data, CVV, UPI credentials, or other payment credentials.
- Redact provider payloads and personal/payment details from logs; retain only approved identifiers and reconciliation facts.
- Alert on signature failures, webhook lag, duplicate/error spikes, reconciliation differences, refund failures, and credential expiry/rotation.

## Test checklist

- Test-mode success, decline, timeout, user cancellation, duplicate callback, and amount/currency mismatch.
- Valid/invalid signature, duplicate, replayed, delayed, and out-of-order webhook events.
- Full and partial payment, overpayment rejection, two simultaneous payment attempts, refund, failed refund, and settlement mismatch.
- Provider outage/rate limit, retry/backoff, dead letter, credential rotation, and webhook-secret rotation.
- No invoice becomes `PAID` from client callback alone; totals remain correct in paise.
- Staff can see pending/failed/reconciliation states without exposing provider secrets.

## Go-live gate

Razorpay remains blocked until the adapter and verified webhook/reconciliation code exist, test-mode E2E/concurrency/security checks pass, finance/legal/privacy operations are approved, monitoring/on-call and rollback are rehearsed, and live credentials are separately authorized. Do not claim online collection or settlement before that gate.
