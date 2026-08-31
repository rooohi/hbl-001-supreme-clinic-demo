WITH RECURSIVE buckets (tenant_id, provider_id, bucket_start_ms, reservation_id, ends_at_ms) AS (
  SELECT tenant_id, provider_id, starts_at_ms, id, ends_at_ms
  FROM schedule_reservations
  WHERE state = 'CONFIRMED'
  UNION ALL
  SELECT tenant_id, provider_id, bucket_start_ms + 300000, reservation_id, ends_at_ms
  FROM buckets
  WHERE bucket_start_ms + 300000 < ends_at_ms
)
INSERT INTO provider_slot_claims (tenant_id, provider_id, bucket_start_ms, reservation_id)
SELECT tenant_id, provider_id, bucket_start_ms, reservation_id FROM buckets;
--> statement-breakpoint
PRAGMA optimize;
