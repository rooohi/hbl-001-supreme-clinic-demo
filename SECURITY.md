# Security

## Current controls

- APIs resolve tenant/location context on the server.
- Zod validates mutations.
- prepared statements avoid SQL interpolation.
- slot uniqueness and idempotency protect booking retries and overlap.
- staff permissions are checked for each staff API operation.
- patient tracking responses omit names, phone numbers, email, and clinical notes.
- errors return structured JSON without stack traces.
- sensitive lifecycle changes append audit records.
- external providers are off unless explicitly configured.

## Preview-only limitations

The current staff adapter does not map a verified subject to persisted staff memberships, roles, or location grants. Patient booking is not OTP verified. Appointment UUIDs are not sufficient production tracking capabilities. PII and clinical text are currently plaintext in the preview database. Rate limiting, CSRF controls, key management, file authorization, malware scanning, webhook verification, SIEM/error monitoring, and tested backup recovery are not complete.

The hosted build must remain owner-only/private until these launch blockers are resolved.

Private-preview builds should keep `NEXT_PUBLIC_ALLOW_INDEXING=false`. This adds
an `X-Robots-Tag` no-index directive, disallows all crawlers in `robots.txt`, and
omits the sitemap. These controls reduce accidental discovery; they are not an
access-control boundary and do not replace authenticated, owner-only hosting.

All routes receive a baseline Content Security Policy, clickjacking protection,
MIME-sniffing protection, a restrictive browser permissions policy, and
cross-origin isolation headers. API responses additionally receive
`Cache-Control: private, no-store`. Production responses emit HSTS, which
browsers enforce only when the application is served over HTTPS.

## Required production controls

1. Fail-closed authentication with secure cookies or signed tokens, rotation, revocation, MFA for privileged roles, and short sessions.
2. Persisted RBAC/ABAC and location/assignment scope on every query.
3. AEAD envelope encryption for PII/clinical data, KMS-managed keys, rotation, and blind indexes.
4. Signed, scoped, expiring patient capabilities plus OTP/family authority.
5. Per-route/user/IP rate limits and abuse monitoring.
6. CSRF protection for cookie-authenticated writes and strict origin policy.
7. Private R2 objects accessed only through authorized, short-lived signed operations.
8. Append-only audit with redacted metadata; never record message bodies, clinical notes, raw contact details, credentials, or signed URLs.
9. Dependency scanning, secret scanning, structured logs, alerting, incident response, backups, and restore drills.
10. Review the Content Security Policy whenever a new external provider, hosted
    asset, analytics service, or embedded UI is introduced; do not weaken it
    globally to make one integration work.

No HIPAA, DPDP, ISO, SOC, or other certification/compliance claim is made.
