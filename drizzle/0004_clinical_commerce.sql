CREATE TABLE `prescriptions` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`appointment_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`prescription_number` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL CHECK (`status` IN ('DRAFT','FINAL','VOID')),
	`clinical_instructions` text,
	`signed_at_ms` integer,
	`row_version` integer DEFAULT 1 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_prescription_number` ON `prescriptions` (`tenant_id`,`prescription_number`);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_prescription_appointment` ON `prescriptions` (`tenant_id`,`appointment_id`);
--> statement-breakpoint
CREATE INDEX `idx_prescription_patient` ON `prescriptions` (`tenant_id`,`patient_id`,`created_at_ms`);
--> statement-breakpoint
CREATE TABLE `prescription_items` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`prescription_id` text NOT NULL,
	`medicine_name` text NOT NULL,
	`generic_name` text,
	`strength` text,
	`dose` text NOT NULL,
	`route` text DEFAULT 'Oral' NOT NULL,
	`frequency` text NOT NULL,
	`timing` text,
	`duration_days` integer,
	`instructions` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_prescription_duration` CHECK (`duration_days` IS NULL OR `duration_days` BETWEEN 1 AND 3650)
);
--> statement-breakpoint
CREATE INDEX `idx_prescription_items` ON `prescription_items` (`tenant_id`,`prescription_id`,`sort_order`);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`appointment_id` text,
	`patient_id` text NOT NULL,
	`invoice_number` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL CHECK (`status` IN ('DRAFT','ISSUED','PARTIALLY_PAID','PAID','VOID','REFUNDED')),
	`currency` text DEFAULT 'INR' NOT NULL,
	`subtotal_paise` integer DEFAULT 0 NOT NULL,
	`discount_paise` integer DEFAULT 0 NOT NULL,
	`tax_paise` integer DEFAULT 0 NOT NULL,
	`total_paise` integer DEFAULT 0 NOT NULL,
	`paid_paise` integer DEFAULT 0 NOT NULL,
	`balance_paise` integer DEFAULT 0 NOT NULL,
	`issued_at_ms` integer,
	`row_version` integer DEFAULT 1 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_invoice_amounts` CHECK (`subtotal_paise` >= 0 AND `discount_paise` >= 0 AND `tax_paise` >= 0 AND `total_paise` >= 0 AND `paid_paise` >= 0 AND `balance_paise` >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_invoice_number` ON `invoices` (`tenant_id`,`invoice_number`);
--> statement-breakpoint
CREATE INDEX `idx_invoice_patient` ON `invoices` (`tenant_id`,`patient_id`,`created_at_ms`);
--> statement-breakpoint
CREATE INDEX `idx_invoice_status` ON `invoices` (`tenant_id`,`status`,`created_at_ms`);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`item_type` text NOT NULL CHECK (`item_type` IN ('SERVICE','PRODUCT','PACKAGE','OTHER')),
	`reference_id` text,
	`description` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_paise` integer NOT NULL,
	`tax_rate_bps` integer DEFAULT 0 NOT NULL,
	`line_subtotal_paise` integer NOT NULL,
	`line_tax_paise` integer DEFAULT 0 NOT NULL,
	`line_total_paise` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_invoice_item_amounts` CHECK (`quantity` > 0 AND `unit_price_paise` >= 0 AND `tax_rate_bps` BETWEEN 0 AND 10000 AND `line_total_paise` >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_invoice_items` ON `invoice_items` (`tenant_id`,`invoice_id`,`sort_order`);
--> statement-breakpoint
CREATE TABLE `payments` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`invoice_id` text NOT NULL,
	`amount_paise` integer NOT NULL,
	`method` text NOT NULL CHECK (`method` IN ('CASH','UPI','CARD','ONLINE','OTHER')),
	`status` text DEFAULT 'RECORDED' NOT NULL CHECK (`status` IN ('RECORDED','REFUNDED','FAILED')),
	`provider_reference` text,
	`note` text,
	`recorded_by_staff_id` text NOT NULL,
	`recorded_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_payment_amount` CHECK (`amount_paise` > 0)
);
--> statement-breakpoint
CREATE INDEX `idx_payments_invoice` ON `payments` (`tenant_id`,`invoice_id`,`recorded_at_ms`);
--> statement-breakpoint
CREATE TABLE `inventory_products` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`category` text NOT NULL CHECK (`category` IN ('MEDICINE','RETAIL_SKINCARE','CONSUMABLE','PROCEDURE_MATERIAL','OTHER')),
	`unit` text DEFAULT 'unit' NOT NULL,
	`barcode` text,
	`reorder_level` integer DEFAULT 0 NOT NULL,
	`selling_price_paise` integer,
	`tax_rate_bps` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_inventory_product_values` CHECK (`reorder_level` >= 0 AND `tax_rate_bps` BETWEEN 0 AND 10000)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_inventory_product_sku` ON `inventory_products` (`tenant_id`,`sku`);
--> statement-breakpoint
CREATE INDEX `idx_inventory_product_name` ON `inventory_products` (`tenant_id`,`name`);
--> statement-breakpoint
CREATE TABLE `inventory_batches` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`product_id` text NOT NULL,
	`batch_number` text NOT NULL,
	`expiry_date` text,
	`quantity_on_hand` integer DEFAULT 0 NOT NULL,
	`purchase_price_paise` integer,
	`mrp_paise` integer,
	`supplier_name` text,
	`received_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_inventory_quantity` CHECK (`quantity_on_hand` >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_inventory_batch` ON `inventory_batches` (`tenant_id`,`product_id`,`batch_number`);
--> statement-breakpoint
CREATE INDEX `idx_inventory_expiry` ON `inventory_batches` (`tenant_id`,`expiry_date`);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`tenant_id` text NOT NULL,
	`id` text NOT NULL,
	`product_id` text NOT NULL,
	`batch_id` text,
	`movement_type` text NOT NULL CHECK (`movement_type` IN ('RECEIPT','SALE','CONSUMPTION','ADJUSTMENT','RETURN','WRITE_OFF')),
	`quantity_delta` integer NOT NULL,
	`appointment_id` text,
	`invoice_id` text,
	`reason` text,
	`actor_staff_id` text NOT NULL,
	`occurred_at_ms` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`tenant_id`, `id`),
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `ck_stock_delta` CHECK (`quantity_delta` <> 0)
);
--> statement-breakpoint
CREATE INDEX `idx_stock_product_time` ON `stock_movements` (`tenant_id`,`product_id`,`occurred_at_ms`);
--> statement-breakpoint
CREATE INDEX `idx_stock_appointment` ON `stock_movements` (`tenant_id`,`appointment_id`);
