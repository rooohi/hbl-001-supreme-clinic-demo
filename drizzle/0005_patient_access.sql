CREATE TABLE `patient_access_tokens` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`purpose` text DEFAULT 'BOOKING_STATUS' NOT NULL CHECK (`purpose` IN ('BOOKING_STATUS')),
	`token_hash` text NOT NULL,
	`expires_at_ms` integer NOT NULL,
	`revoked_at_ms` integer,
	`last_used_at_ms` integer,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_patient_access_token_hash` ON `patient_access_tokens` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `idx_patient_access_appointment` ON `patient_access_tokens` (`tenant_id`,`appointment_id`,`expires_at_ms`);
--> statement-breakpoint
CREATE TABLE `public_rate_limits` (
	`key_hash` text NOT NULL,
	`route_key` text NOT NULL,
	`window_start_ms` integer NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`key_hash`, `route_key`, `window_start_ms`),
	CONSTRAINT `ck_public_rate_count` CHECK (`request_count` >= 0)
);
