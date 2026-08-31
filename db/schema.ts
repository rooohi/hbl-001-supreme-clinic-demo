import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
};

export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull(),
  legalName: text("legal_name").notNull(),
  defaultTimezone: text("default_timezone").notNull().default("Asia/Kolkata"),
  status: text("status", { enum: ["ACTIVE", "SUSPENDED", "CLOSED"] }).notNull().default("ACTIVE"),
  ...timestamps,
});

export const locations = sqliteTable("locations", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  address: text("address"),
  phoneE164: text("phone_e164"),
  opensMinute: integer("opens_minute").notNull().default(660),
  closesMinute: integer("closes_minute").notNull().default(1080),
  workingDaysJson: text("working_days_json").notNull().default("[1,2,3,4,5,6]"),
  status: text("status", { enum: ["ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_locations_tenant_slug").on(table.tenantId, table.slug),
]);

export const staffMembers = sqliteTable("staff_members", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  authSubject: text("auth_subject"),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  title: text("title"),
  isProvider: integer("is_provider", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["INVITED", "ACTIVE", "INACTIVE"] }).notNull().default("ACTIVE"),
  lastLoginAt: integer("last_login_at_ms"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_staff_tenant_email").on(table.tenantId, table.email),
  index("idx_staff_auth_subject").on(table.authSubject),
]);

export const roles = sqliteTable("roles", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  name: text("name").notNull(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_roles_tenant_name").on(table.tenantId, table.name),
]);

export const permissions = sqliteTable("permissions", {
  code: text("code").primaryKey(),
  description: text("description").notNull(),
});

export const rolePermissions = sqliteTable("role_permissions", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  roleId: text("role_id").notNull(),
  permissionCode: text("permission_code").notNull().references(() => permissions.code),
  scope: text("scope", { enum: ["TENANT", "LOCATION", "ASSIGNED", "SELF"] }).notNull().default("TENANT"),
}, (table) => [primaryKey({ columns: [table.tenantId, table.roleId, table.permissionCode] })]);

export const staffRoleAssignments = sqliteTable("staff_role_assignments", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  staffId: text("staff_id").notNull(),
  roleId: text("role_id").notNull(),
  createdAt: integer("created_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [primaryKey({ columns: [table.tenantId, table.staffId, table.roleId] })]);

export const services = sqliteTable("services", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  defaultDurationMinutes: integer("default_duration_minutes").notNull(),
  turnoverBufferMinutes: integer("turnover_buffer_minutes").notNull().default(0),
  pricePaise: integer("price_paise"),
  currency: text("currency").notNull().default("INR"),
  bookingMode: text("booking_mode", { enum: ["PUBLIC", "STAFF_ONLY", "REFERRAL"] }).notNull().default("PUBLIC"),
  instructions: text("instructions"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_services_tenant_code").on(table.tenantId, table.code),
  check("ck_service_duration", sql`${table.defaultDurationMinutes} BETWEEN 5 AND 480`),
]);

export const patients = sqliteTable("patients", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  patientNumber: text("patient_number").notNull(),
  displayName: text("display_name").notNull(),
  phoneE164: text("phone_e164").notNull(),
  phoneLast4: text("phone_last4").notNull(),
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender", { enum: ["FEMALE", "MALE", "NON_BINARY", "OTHER", "UNDISCLOSED"] }),
  preferredLocale: text("preferred_locale").notNull().default("en-IN"),
  status: text("status", { enum: ["ACTIVE", "MERGED", "INACTIVE", "ERASURE_PENDING"] }).notNull().default("ACTIVE"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_patients_tenant_number").on(table.tenantId, table.patientNumber),
  index("idx_patients_tenant_phone").on(table.tenantId, table.phoneE164),
  index("idx_patients_tenant_name").on(table.tenantId, table.displayName),
]);

export const families = sqliteTable("families", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  label: text("label"),
  ...timestamps,
}, (table) => [primaryKey({ columns: [table.tenantId, table.id] })]);

export const familyMembers = sqliteTable("family_members", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  familyId: text("family_id").notNull(),
  patientId: text("patient_id").notNull(),
  relationship: text("relationship", { enum: ["SELF", "SPOUSE", "CHILD", "PARENT", "SIBLING", "DEPENDENT", "OTHER"] }).notNull(),
  isPrimaryContact: integer("is_primary_contact", { mode: "boolean" }).notNull().default(false),
  canManageBookings: integer("can_manage_bookings", { mode: "boolean" }).notNull().default(false),
  addedAt: integer("added_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [primaryKey({ columns: [table.tenantId, table.familyId, table.patientId] })]);

export const scheduleReservations = sqliteTable("schedule_reservations", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  locationId: text("location_id").notNull(),
  providerId: text("provider_id").notNull(),
  kind: text("kind", { enum: ["APPOINTMENT", "BLOCK", "UNAVAILABLE"] }).notNull(),
  state: text("state", { enum: ["HELD", "CONFIRMED", "RELEASED", "EXPIRED"] }).notNull(),
  startsAt: integer("starts_at_ms").notNull(),
  endsAt: integer("ends_at_ms").notNull(),
  expiresAt: integer("expires_at_ms"),
  reason: text("reason"),
  rowVersion: integer("row_version").notNull().default(1),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_reservation_calendar").on(table.tenantId, table.locationId, table.providerId, table.startsAt),
  check("ck_reservation_range", sql`${table.endsAt} > ${table.startsAt}`),
]);

export const providerSlotClaims = sqliteTable("provider_slot_claims", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  providerId: text("provider_id").notNull(),
  bucketStart: integer("bucket_start_ms").notNull(),
  reservationId: text("reservation_id").notNull(),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.providerId, table.bucketStart] }),
  index("idx_slot_claim_reservation").on(table.tenantId, table.reservationId),
]);

export const appointments = sqliteTable("appointments", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  reservationId: text("reservation_id").notNull(),
  patientId: text("patient_id").notNull(),
  serviceId: text("service_id").notNull(),
  locationId: text("location_id").notNull(),
  providerId: text("provider_id").notNull(),
  type: text("appointment_type", { enum: ["NEW_CONSULTATION", "FOLLOW_UP", "REPORT_REVIEW", "PROCEDURE", "LASER_SESSION", "COSMETOLOGY", "CUSTOM"] }).notNull(),
  status: text("status", { enum: ["SCHEDULED", "CONFIRMED", "ARRIVED", "WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED", "NO_SHOW", "SKIPPED"] }).notNull().default("CONFIRMED"),
  bookingSource: text("booking_source", { enum: ["STAFF", "PUBLIC_WEB", "WALK_IN", "FOLLOW_UP", "WAITLIST", "IMPORT"] }).notNull(),
  serviceNameSnapshot: text("service_name_snapshot").notNull(),
  durationMinutesSnapshot: integer("duration_minutes_snapshot").notNull(),
  scheduledAt: integer("scheduled_at_ms").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  idempotencyKey: text("idempotency_key").notNull(),
  bookedAt: integer("booked_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
  arrivedAt: integer("arrived_at_ms"),
  consultationStartedAt: integer("consultation_started_at_ms"),
  consultationEndedAt: integer("consultation_ended_at_ms"),
  cancelledAt: integer("cancelled_at_ms"),
  rowVersion: integer("row_version").notNull().default(1),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_appointments_reservation").on(table.tenantId, table.reservationId),
  uniqueIndex("uq_appointments_idempotency").on(table.tenantId, table.idempotencyKey),
  index("idx_appointments_calendar").on(table.tenantId, table.locationId, table.scheduledAt),
  index("idx_appointments_patient").on(table.tenantId, table.patientId, table.scheduledAt),
  index("idx_appointments_status").on(table.tenantId, table.status, table.scheduledAt),
]);

export const appointmentEvents = sqliteTable("appointment_events", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  appointmentId: text("appointment_id").notNull(),
  eventType: text("event_type").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  actorType: text("actor_type", { enum: ["STAFF", "PATIENT", "SYSTEM"] }).notNull(),
  actorId: text("actor_id"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  occurredAt: integer("occurred_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_appointment_events").on(table.tenantId, table.appointmentId, table.occurredAt),
]);

export const queues = sqliteTable("queues", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  locationId: text("location_id").notNull(),
  providerId: text("provider_id").notNull(),
  serviceDate: text("service_date_local").notNull(),
  status: text("status", { enum: ["OPEN", "PAUSED", "CLOSED"] }).notNull().default("OPEN"),
  nextToken: integer("next_token").notNull().default(1),
  nextSequence: integer("next_sequence").notNull().default(1),
  estimateVersion: integer("estimate_version").notNull().default(1),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_queue_day").on(table.tenantId, table.locationId, table.providerId, table.serviceDate),
]);

export const queueEntries = sqliteTable("queue_entries", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  queueId: text("queue_id").notNull(),
  appointmentId: text("appointment_id").notNull(),
  tokenNumber: integer("token_number").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  status: text("status", { enum: ["WAITING", "CALLED", "IN_CONSULTATION", "COMPLETED", "SKIPPED", "NO_SHOW", "LEFT"] }).notNull(),
  estimatedDurationSeconds: integer("estimated_duration_seconds").notNull(),
  estimatedStartAt: integer("estimated_start_at_ms"),
  estimatedWaitSeconds: integer("estimated_wait_seconds"),
  joinedAt: integer("joined_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
  startedAt: integer("started_at_ms"),
  completedAt: integer("completed_at_ms"),
  rowVersion: integer("row_version").notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_queue_token").on(table.tenantId, table.queueId, table.tokenNumber),
  uniqueIndex("uq_queue_appointment").on(table.tenantId, table.appointmentId),
  index("idx_queue_waiting").on(table.tenantId, table.queueId, table.status, table.sequenceNumber),
]);

export const consultations = sqliteTable("consultations", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  appointmentId: text("appointment_id").notNull(),
  patientId: text("patient_id").notNull(),
  providerId: text("provider_id").notNull(),
  status: text("status", { enum: ["IN_PROGRESS", "COMPLETED", "SIGNED", "AMENDED"] }).notNull(),
  reason: text("reason"),
  clinicalNote: text("clinical_note"),
  followUpPlan: text("follow_up_plan"),
  startedAt: integer("started_at_ms").notNull(),
  endedAt: integer("ended_at_ms"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_consultation_appointment").on(table.tenantId, table.appointmentId),
  index("idx_consultation_patient").on(table.tenantId, table.patientId, table.startedAt),
]);

export const prescriptions = sqliteTable("prescriptions", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  appointmentId: text("appointment_id").notNull(),
  patientId: text("patient_id").notNull(),
  providerId: text("provider_id").notNull(),
  prescriptionNumber: text("prescription_number").notNull(),
  status: text("status", { enum: ["DRAFT", "FINAL", "VOID"] }).notNull().default("DRAFT"),
  clinicalInstructions: text("clinical_instructions"),
  signedAt: integer("signed_at_ms"),
  rowVersion: integer("row_version").notNull().default(1),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_prescription_number").on(table.tenantId, table.prescriptionNumber),
  uniqueIndex("uq_prescription_appointment").on(table.tenantId, table.appointmentId),
  index("idx_prescription_patient").on(table.tenantId, table.patientId, table.createdAt),
]);

export const prescriptionItems = sqliteTable("prescription_items", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  prescriptionId: text("prescription_id").notNull(),
  medicineName: text("medicine_name").notNull(),
  genericName: text("generic_name"),
  strength: text("strength"),
  dose: text("dose").notNull(),
  route: text("route").notNull().default("Oral"),
  frequency: text("frequency").notNull(),
  timing: text("timing"),
  durationDays: integer("duration_days"),
  instructions: text("instructions"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_prescription_items").on(table.tenantId, table.prescriptionId, table.sortOrder),
  check("ck_prescription_duration", sql`${table.durationDays} IS NULL OR ${table.durationDays} BETWEEN 1 AND 3650`),
]);

export const invoices = sqliteTable("invoices", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  appointmentId: text("appointment_id"),
  patientId: text("patient_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  status: text("status", { enum: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "VOID", "REFUNDED"] }).notNull().default("DRAFT"),
  currency: text("currency").notNull().default("INR"),
  subtotalPaise: integer("subtotal_paise").notNull().default(0),
  discountPaise: integer("discount_paise").notNull().default(0),
  taxPaise: integer("tax_paise").notNull().default(0),
  totalPaise: integer("total_paise").notNull().default(0),
  paidPaise: integer("paid_paise").notNull().default(0),
  balancePaise: integer("balance_paise").notNull().default(0),
  issuedAt: integer("issued_at_ms"),
  rowVersion: integer("row_version").notNull().default(1),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_invoice_number").on(table.tenantId, table.invoiceNumber),
  index("idx_invoice_patient").on(table.tenantId, table.patientId, table.createdAt),
  index("idx_invoice_status").on(table.tenantId, table.status, table.createdAt),
  check("ck_invoice_amounts", sql`${table.subtotalPaise} >= 0 AND ${table.discountPaise} >= 0 AND ${table.taxPaise} >= 0 AND ${table.totalPaise} >= 0 AND ${table.paidPaise} >= 0 AND ${table.balancePaise} >= 0`),
]);

export const invoiceItems = sqliteTable("invoice_items", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  invoiceId: text("invoice_id").notNull(),
  itemType: text("item_type", { enum: ["SERVICE", "PRODUCT", "PACKAGE", "OTHER"] }).notNull(),
  referenceId: text("reference_id"),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPricePaise: integer("unit_price_paise").notNull(),
  taxRateBps: integer("tax_rate_bps").notNull().default(0),
  lineSubtotalPaise: integer("line_subtotal_paise").notNull(),
  lineTaxPaise: integer("line_tax_paise").notNull().default(0),
  lineTotalPaise: integer("line_total_paise").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_invoice_items").on(table.tenantId, table.invoiceId, table.sortOrder),
  check("ck_invoice_item_amounts", sql`${table.quantity} > 0 AND ${table.unitPricePaise} >= 0 AND ${table.taxRateBps} BETWEEN 0 AND 10000 AND ${table.lineTotalPaise} >= 0`),
]);

export const payments = sqliteTable("payments", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  invoiceId: text("invoice_id").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  method: text("method", { enum: ["CASH", "UPI", "CARD", "ONLINE", "OTHER"] }).notNull(),
  status: text("status", { enum: ["RECORDED", "REFUNDED", "FAILED"] }).notNull().default("RECORDED"),
  providerReference: text("provider_reference"),
  note: text("note"),
  recordedByStaffId: text("recorded_by_staff_id").notNull(),
  recordedAt: integer("recorded_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_payments_invoice").on(table.tenantId, table.invoiceId, table.recordedAt),
  check("ck_payment_amount", sql`${table.amountPaise} > 0`),
]);

export const inventoryProducts = sqliteTable("inventory_products", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category", { enum: ["MEDICINE", "RETAIL_SKINCARE", "CONSUMABLE", "PROCEDURE_MATERIAL", "OTHER"] }).notNull(),
  unit: text("unit").notNull().default("unit"),
  barcode: text("barcode"),
  reorderLevel: integer("reorder_level").notNull().default(0),
  sellingPricePaise: integer("selling_price_paise"),
  taxRateBps: integer("tax_rate_bps").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_inventory_product_sku").on(table.tenantId, table.sku),
  index("idx_inventory_product_name").on(table.tenantId, table.name),
  check("ck_inventory_product_values", sql`${table.reorderLevel} >= 0 AND ${table.taxRateBps} BETWEEN 0 AND 10000`),
]);

export const inventoryBatches = sqliteTable("inventory_batches", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  productId: text("product_id").notNull(),
  batchNumber: text("batch_number").notNull(),
  expiryDate: text("expiry_date"),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  purchasePricePaise: integer("purchase_price_paise"),
  mrpPaise: integer("mrp_paise"),
  supplierName: text("supplier_name"),
  receivedAt: integer("received_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_inventory_batch").on(table.tenantId, table.productId, table.batchNumber),
  index("idx_inventory_expiry").on(table.tenantId, table.expiryDate),
  check("ck_inventory_quantity", sql`${table.quantityOnHand} >= 0`),
]);

export const stockMovements = sqliteTable("stock_movements", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  productId: text("product_id").notNull(),
  batchId: text("batch_id"),
  movementType: text("movement_type", { enum: ["RECEIPT", "SALE", "CONSUMPTION", "ADJUSTMENT", "RETURN", "WRITE_OFF"] }).notNull(),
  quantityDelta: integer("quantity_delta").notNull(),
  appointmentId: text("appointment_id"),
  invoiceId: text("invoice_id"),
  reason: text("reason"),
  actorStaffId: text("actor_staff_id").notNull(),
  occurredAt: integer("occurred_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_stock_product_time").on(table.tenantId, table.productId, table.occurredAt),
  index("idx_stock_appointment").on(table.tenantId, table.appointmentId),
  check("ck_stock_delta", sql`${table.quantityDelta} <> 0`),
]);

export const followUps = sqliteTable("follow_ups", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  patientId: text("patient_id").notNull(),
  sourceAppointmentId: text("source_appointment_id"),
  assignedStaffId: text("assigned_staff_id"),
  intervalCode: text("interval_code", { enum: ["3D", "7D", "15D", "1M", "3M", "CUSTOM"] }).notNull(),
  dueDate: text("due_local_date").notNull(),
  status: text("status", { enum: ["UPCOMING", "DUE", "OVERDUE", "BOOKED", "COMPLETED", "DISMISSED"] }).notNull(),
  bookedAppointmentId: text("booked_appointment_id"),
  note: text("note"),
  completedAt: integer("completed_at_ms"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_followups_worklist").on(table.tenantId, table.status, table.dueDate),
  index("idx_followups_patient").on(table.tenantId, table.patientId, table.dueDate),
]);

export const waitlistEntries = sqliteTable("waitlist_entries", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  patientId: text("patient_id").notNull(),
  locationId: text("location_id").notNull(),
  serviceId: text("service_id").notNull(),
  preference: text("preference", { enum: ["EARLIEST", "EARLIER_THAN_CURRENT", "DATE_RANGE"] }).notNull(),
  earliestDate: text("earliest_local_date").notNull(),
  latestDate: text("latest_local_date"),
  windowStartMinute: integer("window_start_minute").notNull().default(0),
  windowEndMinute: integer("window_end_minute").notNull().default(1440),
  status: text("status", { enum: ["ACTIVE", "OFFERED", "BOOKED", "EXPIRED", "WITHDRAWN"] }).notNull().default("ACTIVE"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_waitlist_match").on(table.tenantId, table.locationId, table.serviceId, table.status, table.earliestDate),
]);

export const messageTemplates = sqliteTable("message_templates", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  eventKey: text("event_key").notNull(),
  channel: text("channel", { enum: ["WHATSAPP", "SMS", "EMAIL", "WEB"] }).notNull(),
  locale: text("locale").notNull().default("en-IN"),
  bodyTemplate: text("body_template").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_message_template").on(table.tenantId, table.eventKey, table.channel, table.locale),
]);

export const messages = sqliteTable("messages", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  patientId: text("patient_id").notNull(),
  appointmentId: text("appointment_id"),
  channel: text("channel", { enum: ["WHATSAPP", "SMS", "EMAIL", "WEB"] }).notNull(),
  purpose: text("purpose", { enum: ["TRANSACTIONAL", "FOLLOW_UP", "MARKETING", "REVIEW"] }).notNull(),
  providerKey: text("provider_key").notNull().default("development"),
  destination: text("destination").notNull(),
  body: text("body").notNull(),
  status: text("status", { enum: ["QUEUED", "SENDING", "SENT", "DELIVERED", "FAILED", "CANCELLED", "SUPPRESSED"] }).notNull().default("QUEUED"),
  idempotencyKey: text("idempotency_key").notNull(),
  scheduledAt: integer("scheduled_at_ms").notNull(),
  sentAt: integer("sent_at_ms"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_messages_idempotency").on(table.tenantId, table.idempotencyKey),
  index("idx_messages_dispatch").on(table.tenantId, table.status, table.scheduledAt),
]);

export const consentRecords = sqliteTable("consent_records", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  patientId: text("patient_id").notNull(),
  purpose: text("purpose", { enum: ["CARE_OPERATIONS", "COMMUNICATION", "MARKETING", "DOCUMENT_STORAGE"] }).notNull(),
  status: text("status", { enum: ["GRANTED", "DENIED", "WITHDRAWN"] }).notNull(),
  policyVersion: text("policy_version").notNull(),
  source: text("source", { enum: ["PATIENT", "STAFF_RECORDED", "IMPORT", "SYSTEM"] }).notNull(),
  capturedAt: integer("captured_at_ms").notNull(),
  withdrawnAt: integer("withdrawn_at_ms"),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_consent_patient").on(table.tenantId, table.patientId, table.capturedAt),
]);

export const patientAccessTokens = sqliteTable("patient_access_tokens", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  appointmentId: text("appointment_id").notNull(),
  purpose: text("purpose", { enum: ["BOOKING_STATUS"] }).notNull().default("BOOKING_STATUS"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at_ms").notNull(),
  revokedAt: integer("revoked_at_ms"),
  lastUsedAt: integer("last_used_at_ms"),
  ...timestamps,
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  uniqueIndex("uq_patient_access_token_hash").on(table.tokenHash),
  index("idx_patient_access_appointment").on(table.tenantId, table.appointmentId, table.expiresAt),
]);

export const publicRateLimits = sqliteTable("public_rate_limits", {
  keyHash: text("key_hash").notNull(),
  routeKey: text("route_key").notNull(),
  windowStart: integer("window_start_ms").notNull(),
  requestCount: integer("request_count").notNull().default(0),
  updatedAt: integer("updated_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  primaryKey({ columns: [table.keyHash, table.routeKey, table.windowStart] }),
  check("ck_public_rate_count", sql`${table.requestCount} >= 0`),
]);

export const auditLogs = sqliteTable("audit_logs", {
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  id: text("id").notNull(),
  actorType: text("actor_type", { enum: ["STAFF", "PATIENT", "SYSTEM", "SUPER_ADMIN"] }).notNull(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  outcome: text("outcome", { enum: ["SUCCESS", "DENIED", "FAILURE"] }).notNull(),
  requestId: text("request_id").notNull(),
  metadataRedactedJson: text("metadata_redacted_json").notNull().default("{}"),
  occurredAt: integer("occurred_at_ms").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => [
  primaryKey({ columns: [table.tenantId, table.id] }),
  index("idx_audit_time").on(table.tenantId, table.occurredAt),
  index("idx_audit_entity").on(table.tenantId, table.entityType, table.entityId, table.occurredAt),
]);
