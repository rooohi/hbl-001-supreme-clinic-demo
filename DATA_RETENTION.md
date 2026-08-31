# Data retention

All periods below are **draft defaults requiring clinic counsel and policy approval**.

| Data class | Draft trigger | Draft action |
| --- | --- | --- |
| Appointment and queue events | Visit completion/cancellation | Retain per approved medical/operational policy; then delete or de-identify |
| Clinical notes/documents | End of care relationship | Retain only for the legally approved clinical period; restricted access |
| Contact and family data | Last active care relationship | Review for minimization; delete or de-identify when no lawful purpose remains |
| Consent/privacy records | Consent capture/revocation | Retain as evidence for the applicable policy period |
| Transactional messages | Delivery/failure | Short operational retention, then redact bodies/destinations |
| Marketing consent | Withdrawal | Suppress immediately; retain minimal proof of withdrawal |
| Audit logs | Event time | Append-only protected retention, then controlled expiry |
| Analytics events | Collection | Aggregate/de-identify early; expire raw events quickly |
| Temporary holds/tokens | Expiry | Delete automatically after a short grace period |
| Backups | Backup creation | Encrypted rolling window with tested expiry and restore |

## Workflow requirements

- retention rules are tenant-configurable only within approved policy limits;
- deletion is asynchronous, idempotent, auditable, and aware of backups/legal holds;
- patient requests receive identity verification and a traceable case record;
- exports are encrypted, time-limited, access-logged, and deleted after delivery;
- production fixtures must never contain fictional patient data from development migrations.
