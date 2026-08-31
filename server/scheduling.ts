import { z } from "zod";
import { getD1 } from "@/db";
import {
  TWACHA_LOCATION_ID,
  TWACHA_PROVIDER_ID,
  TWACHA_TENANT_ID,
  parseIndiaDateTime,
} from "@/server/clinic-context";

export const appointmentInputSchema = z.object({
  patientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(18),
  email: z.string().trim().email().optional().or(z.literal("")),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["NEW_CONSULTATION", "FOLLOW_UP", "REPORT_REVIEW", "PROCEDURE", "LASER_SESSION", "COSMETOLOGY", "CUSTOM"]),
  reason: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  consent: z.boolean().default(false),
});

export type AppointmentInput = z.infer<typeof appointmentInputSchema>;

function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (value.startsWith("+") && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  throw new Error("Enter a valid mobile number");
}

export async function createAppointment(
  raw: unknown,
  options: { idempotencyKey: string; actorType: "STAFF" | "PATIENT"; actorId?: string },
) {
  const input = appointmentInputSchema.parse(raw);
  if (options.actorType === "PATIENT" && !input.consent) {
    throw new Error("Consent is required to create a patient booking");
  }

  const d1 = getD1();
  // The caller's authenticated channel, never request JSON, owns attribution.
  // This prevents staff requests from being mislabeled as public demand (and
  // public requests from impersonating an internal booking source).
  const bookingSource = options.actorType === "PATIENT" ? "PUBLIC_WEB" : "STAFF";
  const phone = normalizeIndianPhone(input.phone);
  const scheduledAt = parseIndiaDateTime(input.date, input.time);
  const now = Date.now();
  if (scheduledAt < now - 300_000) throw new Error("Choose a future appointment time");
  if (scheduledAt > now + 180 * 86_400_000) throw new Error("Appointments can be booked up to 180 days ahead");
  const dayOfWeek = new Date(`${input.date}T12:00:00+05:30`).getUTCDay();
  if (dayOfWeek === 0) throw new Error("Twacha Clinic is closed on Sundays");
  const [hour, minute] = input.time.split(":").map(Number);
  const minuteOfDay = hour * 60 + minute;
  if (minute % 20 !== 0) throw new Error("Choose one of the available 20-minute slot starts");

  const existing = await d1.prepare(
    "SELECT id, status, scheduled_at_ms AS scheduledAt FROM appointments WHERE tenant_id = ? AND idempotency_key = ? LIMIT 1",
  ).bind(TWACHA_TENANT_ID, options.idempotencyKey).first<{ id: string; status: string; scheduledAt: number }>();
  if (existing) return { ...existing, replayed: true };

  const service = await d1.prepare(
    "SELECT id, name, default_duration_minutes AS duration, turnover_buffer_minutes AS buffer FROM services WHERE tenant_id = ? AND id = ? AND active = 1 AND (? = 'STAFF' OR booking_mode = 'PUBLIC') LIMIT 1",
  ).bind(TWACHA_TENANT_ID, input.serviceId, options.actorType).first<{ id: string; name: string; duration: number; buffer: number }>();
  if (!service) throw new Error("Selected service is unavailable");

  const endsAt = scheduledAt + (service.duration + service.buffer) * 60_000;
  if (minuteOfDay < 660 || endsAt > parseIndiaDateTime(input.date, "18:00")) {
    throw new Error("Choose a time within clinic hours, 11:00 AM to 6:00 PM");
  }
  // A public name + phone pair is not identity proof. Until OTP/family authority
  // is connected, only verified staff bookings may attach to an existing chart.
  const patientMatch = options.actorType === "STAFF" ? await d1.prepare(
    "SELECT id, display_name AS displayName FROM patients WHERE tenant_id = ? AND phone_e164 = ? AND lower(display_name) = lower(?) AND status = 'ACTIVE' ORDER BY created_at_ms LIMIT 1",
  ).bind(TWACHA_TENANT_ID, phone, input.patientName).first<{ id: string; displayName: string }>() : null;

  const patientId = patientMatch?.id ?? crypto.randomUUID();
  const reservationId = crypto.randomUUID();
  const appointmentId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const consentId = crypto.randomUUID();
  const phoneLast4 = phone.slice(-4);
  const patientNumber = `TWC-${appointmentId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

  const statements = [];
  if (!patientMatch) {
    statements.push(d1.prepare(
      "INSERT INTO patients (tenant_id,id,patient_number,display_name,phone_e164,phone_last4,email,preferred_locale,status,created_at_ms,updated_at_ms) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    ).bind(TWACHA_TENANT_ID, patientId, patientNumber, input.patientName, phone, phoneLast4, input.email || null, "en-IN", "ACTIVE", now, now));
  }

  statements.push(d1.prepare(
    "INSERT INTO schedule_reservations (tenant_id,id,location_id,provider_id,kind,state,starts_at_ms,ends_at_ms,row_version,created_at_ms,updated_at_ms) VALUES (?,?,?,?,?,?,?,?,1,?,?)",
  ).bind(TWACHA_TENANT_ID, reservationId, TWACHA_LOCATION_ID, TWACHA_PROVIDER_ID, "APPOINTMENT", "CONFIRMED", scheduledAt, endsAt, now, now));

  for (let bucket = scheduledAt; bucket < endsAt; bucket += 300_000) {
    statements.push(d1.prepare(
      "INSERT INTO provider_slot_claims (tenant_id,provider_id,bucket_start_ms,reservation_id) VALUES (?,?,?,?)",
    ).bind(TWACHA_TENANT_ID, TWACHA_PROVIDER_ID, bucket, reservationId));
  }

  statements.push(d1.prepare(
    "INSERT INTO appointments (tenant_id,id,reservation_id,patient_id,service_id,location_id,provider_id,appointment_type,status,booking_source,service_name_snapshot,duration_minutes_snapshot,scheduled_at_ms,reason,notes,idempotency_key,booked_at_ms,row_version,created_at_ms,updated_at_ms) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)",
  ).bind(TWACHA_TENANT_ID, appointmentId, reservationId, patientId, input.serviceId, TWACHA_LOCATION_ID, TWACHA_PROVIDER_ID, input.type, "CONFIRMED", bookingSource, service.name, service.duration, scheduledAt, input.reason || null, input.notes || null, options.idempotencyKey, now, now, now));

  statements.push(d1.prepare(
    "INSERT INTO appointment_events (tenant_id,id,appointment_id,event_type,to_status,actor_type,actor_id,metadata_json,occurred_at_ms) VALUES (?,?,?,?,?,?,?,?,?)",
  ).bind(TWACHA_TENANT_ID, eventId, appointmentId, "appointment.created", "CONFIRMED", options.actorType, options.actorId ?? null, JSON.stringify({ source: bookingSource }), now));

  if (options.actorType === "PATIENT") {
    statements.push(d1.prepare(
      "INSERT INTO consent_records (tenant_id,id,patient_id,purpose,status,policy_version,source,captured_at_ms) VALUES (?,?,?,?,?,?,?,?)",
    ).bind(TWACHA_TENANT_ID, consentId, patientId, "CARE_OPERATIONS", "GRANTED", "2026-08", "PATIENT", now));
  }

  statements.push(d1.prepare(
    "INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
  ).bind(TWACHA_TENANT_ID, auditId, options.actorType, options.actorId ?? null, "appointment.create", "appointment", appointmentId, "SUCCESS", options.idempotencyKey, JSON.stringify({ source: bookingSource }), now));

  await d1.batch(statements);
  return { id: appointmentId, patientId, status: "CONFIRMED", scheduledAt, serviceName: service.name, replayed: false };
}
