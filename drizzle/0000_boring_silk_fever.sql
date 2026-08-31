CREATE TABLE `appointment_events` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`event_type` text NOT NULL,
	`from_status` text,
	`to_status` text,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`occurred_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_appointment_events` ON `appointment_events` (`tenant_id`,`appointment_id`,`occurred_at_ms`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`reservation_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`service_id` text NOT NULL,
	`location_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`appointment_type` text NOT NULL,
	`status` text DEFAULT 'CONFIRMED' NOT NULL,
	`booking_source` text NOT NULL,
	`service_name_snapshot` text NOT NULL,
	`duration_minutes_snapshot` integer NOT NULL,
	`scheduled_at_ms` integer NOT NULL,
	`reason` text,
	`notes` text,
	`idempotency_key` text NOT NULL,
	`booked_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`arrived_at_ms` integer,
	`consultation_started_at_ms` integer,
	`consultation_ended_at_ms` integer,
	`cancelled_at_ms` integer,
	`row_version` integer DEFAULT 1 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_appointments_reservation` ON `appointments` (`tenant_id`,`reservation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_appointments_idempotency` ON `appointments` (`tenant_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_appointments_calendar` ON `appointments` (`tenant_id`,`location_id`,`scheduled_at_ms`);--> statement-breakpoint
CREATE INDEX `idx_appointments_patient` ON `appointments` (`tenant_id`,`patient_id`,`scheduled_at_ms`);--> statement-breakpoint
CREATE INDEX `idx_appointments_status` ON `appointments` (`tenant_id`,`status`,`scheduled_at_ms`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`outcome` text NOT NULL,
	`request_id` text NOT NULL,
	`metadata_redacted_json` text DEFAULT '{}' NOT NULL,
	`occurred_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_time` ON `audit_logs` (`tenant_id`,`occurred_at_ms`);--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_logs` (`tenant_id`,`entity_type`,`entity_id`,`occurred_at_ms`);--> statement-breakpoint
CREATE TABLE `consent_records` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`patient_id` text NOT NULL,
	`purpose` text NOT NULL,
	`status` text NOT NULL,
	`policy_version` text NOT NULL,
	`source` text NOT NULL,
	`captured_at_ms` integer NOT NULL,
	`withdrawn_at_ms` integer,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_consent_patient` ON `consent_records` (`tenant_id`,`patient_id`,`captured_at_ms`);--> statement-breakpoint
CREATE TABLE `consultations` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`status` text NOT NULL,
	`reason` text,
	`clinical_note` text,
	`follow_up_plan` text,
	`started_at_ms` integer NOT NULL,
	`ended_at_ms` integer,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_consultation_appointment` ON `consultations` (`tenant_id`,`appointment_id`);--> statement-breakpoint
CREATE INDEX `idx_consultation_patient` ON `consultations` (`tenant_id`,`patient_id`,`started_at_ms`);--> statement-breakpoint
CREATE TABLE `families` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`label` text,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`tenant_id` text NOT NULL,
	`family_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`relationship` text NOT NULL,
	`is_primary_contact` integer DEFAULT false NOT NULL,
	`can_manage_bookings` integer DEFAULT false NOT NULL,
	`added_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `family_id`, `patient_id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `follow_ups` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`patient_id` text NOT NULL,
	`source_appointment_id` text,
	`assigned_staff_id` text,
	`interval_code` text NOT NULL,
	`due_local_date` text NOT NULL,
	`status` text NOT NULL,
	`booked_appointment_id` text,
	`note` text,
	`completed_at_ms` integer,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_followups_worklist` ON `follow_ups` (`tenant_id`,`status`,`due_local_date`);--> statement-breakpoint
CREATE INDEX `idx_followups_patient` ON `follow_ups` (`tenant_id`,`patient_id`,`due_local_date`);--> statement-breakpoint
CREATE TABLE `locations` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`timezone` text DEFAULT 'Asia/Kolkata' NOT NULL,
	`address` text,
	`phone_e164` text,
	`opens_minute` integer DEFAULT 660 NOT NULL,
	`closes_minute` integer DEFAULT 1080 NOT NULL,
	`working_days_json` text DEFAULT '[1,2,3,4,5,6]' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_locations_tenant_slug` ON `locations` (`tenant_id`,`slug`);--> statement-breakpoint
CREATE TABLE `message_templates` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`event_key` text NOT NULL,
	`channel` text NOT NULL,
	`locale` text DEFAULT 'en-IN' NOT NULL,
	`body_template` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_message_template` ON `message_templates` (`tenant_id`,`event_key`,`channel`,`locale`);--> statement-breakpoint
CREATE TABLE `messages` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`patient_id` text NOT NULL,
	`appointment_id` text,
	`channel` text NOT NULL,
	`purpose` text NOT NULL,
	`provider_key` text DEFAULT 'development' NOT NULL,
	`destination` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'QUEUED' NOT NULL,
	`idempotency_key` text NOT NULL,
	`scheduled_at_ms` integer NOT NULL,
	`sent_at_ms` integer,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_messages_idempotency` ON `messages` (`tenant_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_messages_dispatch` ON `messages` (`tenant_id`,`status`,`scheduled_at_ms`);--> statement-breakpoint
CREATE TABLE `patients` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`patient_number` text NOT NULL,
	`display_name` text NOT NULL,
	`phone_e164` text NOT NULL,
	`phone_last4` text NOT NULL,
	`email` text,
	`date_of_birth` text,
	`gender` text,
	`preferred_locale` text DEFAULT 'en-IN' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_patients_tenant_number` ON `patients` (`tenant_id`,`patient_number`);--> statement-breakpoint
CREATE INDEX `idx_patients_tenant_phone` ON `patients` (`tenant_id`,`phone_e164`);--> statement-breakpoint
CREATE INDEX `idx_patients_tenant_name` ON `patients` (`tenant_id`,`display_name`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`code` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `provider_slot_claims` (
	`tenant_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`bucket_start_ms` integer NOT NULL,
	`reservation_id` text NOT NULL,
	PRIMARY KEY(`tenant_id`, `provider_id`, `bucket_start_ms`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_slot_claim_reservation` ON `provider_slot_claims` (`tenant_id`,`reservation_id`);--> statement-breakpoint
CREATE TABLE `queue_entries` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`queue_id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`token_number` integer NOT NULL,
	`sequence_number` integer NOT NULL,
	`status` text NOT NULL,
	`estimated_duration_seconds` integer NOT NULL,
	`estimated_start_at_ms` integer,
	`estimated_wait_seconds` integer,
	`joined_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`started_at_ms` integer,
	`completed_at_ms` integer,
	`row_version` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_queue_token` ON `queue_entries` (`tenant_id`,`queue_id`,`token_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_queue_appointment` ON `queue_entries` (`tenant_id`,`appointment_id`);--> statement-breakpoint
CREATE INDEX `idx_queue_waiting` ON `queue_entries` (`tenant_id`,`queue_id`,`status`,`sequence_number`);--> statement-breakpoint
CREATE TABLE `queues` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`location_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`service_date_local` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`next_token` integer DEFAULT 1 NOT NULL,
	`next_sequence` integer DEFAULT 1 NOT NULL,
	`estimate_version` integer DEFAULT 1 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_queue_day` ON `queues` (`tenant_id`,`location_id`,`provider_id`,`service_date_local`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`tenant_id` text NOT NULL,
	`role_id` text NOT NULL,
	`permission_code` text NOT NULL,
	`scope` text DEFAULT 'TENANT' NOT NULL,
	PRIMARY KEY(`tenant_id`, `role_id`, `permission_code`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_code`) REFERENCES `permissions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`name` text NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_roles_tenant_name` ON `roles` (`tenant_id`,`name`);--> statement-breakpoint
CREATE TABLE `schedule_reservations` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`location_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`kind` text NOT NULL,
	`state` text NOT NULL,
	`starts_at_ms` integer NOT NULL,
	`ends_at_ms` integer NOT NULL,
	`expires_at_ms` integer,
	`reason` text,
	`row_version` integer DEFAULT 1 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_reservation_range" CHECK("schedule_reservations"."ends_at_ms" > "schedule_reservations"."starts_at_ms")
);
--> statement-breakpoint
CREATE INDEX `idx_reservation_calendar` ON `schedule_reservations` (`tenant_id`,`location_id`,`provider_id`,`starts_at_ms`);--> statement-breakpoint
CREATE TABLE `services` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`default_duration_minutes` integer NOT NULL,
	`turnover_buffer_minutes` integer DEFAULT 0 NOT NULL,
	`price_paise` integer,
	`currency` text DEFAULT 'INR' NOT NULL,
	`booking_mode` text DEFAULT 'PUBLIC' NOT NULL,
	`instructions` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_service_duration" CHECK("services"."default_duration_minutes" BETWEEN 5 AND 480)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_services_tenant_code` ON `services` (`tenant_id`,`code`);--> statement-breakpoint
CREATE TABLE `staff_members` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`auth_subject` text,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`title` text,
	`is_provider` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`last_login_at_ms` integer,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_staff_tenant_email` ON `staff_members` (`tenant_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_staff_auth_subject` ON `staff_members` (`auth_subject`);--> statement-breakpoint
CREATE TABLE `staff_role_assignments` (
	`tenant_id` text NOT NULL,
	`staff_id` text NOT NULL,
	`role_id` text NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `staff_id`, `role_id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`legal_name` text NOT NULL,
	`default_timezone` text DEFAULT 'Asia/Kolkata' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE TABLE `waitlist_entries` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`patient_id` text NOT NULL,
	`location_id` text NOT NULL,
	`service_id` text NOT NULL,
	`preference` text NOT NULL,
	`earliest_local_date` text NOT NULL,
	`latest_local_date` text,
	`window_start_minute` integer DEFAULT 0 NOT NULL,
	`window_end_minute` integer DEFAULT 1440 NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_waitlist_match` ON `waitlist_entries` (`tenant_id`,`location_id`,`service_id`,`status`,`earliest_local_date`);