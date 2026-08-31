UPDATE queues
SET next_token = COALESCE((
      SELECT MAX(queue_entries.token_number) + 1
      FROM queue_entries
      WHERE queue_entries.tenant_id = queues.tenant_id
        AND queue_entries.queue_id = queues.id
    ), 1),
    next_sequence = COALESCE((
      SELECT MAX(queue_entries.sequence_number) + 1
      FROM queue_entries
      WHERE queue_entries.tenant_id = queues.tenant_id
        AND queue_entries.queue_id = queues.id
    ), 1),
    updated_at_ms = unixepoch() * 1000;
