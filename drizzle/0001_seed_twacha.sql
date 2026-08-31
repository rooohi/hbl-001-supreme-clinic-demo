-- Production-safe reference data only.
-- Synthetic patients and care-state records belong in db/seeds/development.sql.

INSERT INTO tenants (id, slug, display_name, legal_name, default_timezone, status)
VALUES ('11111111-1111-4111-8111-111111111111', 'twacha', 'Twacha Skin • Hair • Laser • Cosmetology Centre', 'Twacha Skin Hair Laser Cosmetology Centre', 'Asia/Kolkata', 'ACTIVE');
--> statement-breakpoint
INSERT INTO locations (tenant_id, id, slug, name, timezone, address, phone_e164, opens_minute, closes_minute, working_days_json, status)
VALUES ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'hubballi', 'Twacha Clinic · Hubballi', 'Asia/Kolkata', 'Address to be confirmed before go-live', NULL, 660, 1080, '[1,2,3,4,5,6]', 'ACTIVE');
--> statement-breakpoint
INSERT INTO staff_members (tenant_id, id, email, display_name, title, is_provider, status)
VALUES
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333331', 'doctor@twacha.example', 'Dr. Suman Odugoudar Dibbad', 'Dermatologist', 1, 'ACTIVE'),
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333332', 'reception@twacha.example', 'Kavya Shetty', 'Receptionist', 0, 'ACTIVE');
--> statement-breakpoint
INSERT INTO roles (tenant_id, id, name, is_system)
VALUES
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444441', 'Clinic Owner', 1),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444442', 'Doctor', 1),
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444443', 'Receptionist', 1);
--> statement-breakpoint
INSERT INTO permissions (code, description)
VALUES
  ('appointments.read', 'View appointments'),
  ('appointments.write', 'Create and update appointments'),
  ('appointments.cancel', 'Cancel appointments'),
  ('queue.read', 'View live queue'),
  ('queue.manage', 'Operate live queue'),
  ('patients.read', 'View patient directory'),
  ('patients.write', 'Create and update patients'),
  ('clinical.read', 'View clinical workspace'),
  ('clinical.write', 'Write consultation notes'),
  ('followups.manage', 'Operate follow-up worklists'),
  ('communications.send', 'Send approved communications'),
  ('settings.manage', 'Manage clinic configuration'),
  ('audit.read', 'View audit events');
--> statement-breakpoint
INSERT INTO role_permissions (tenant_id, role_id, permission_code, scope)
SELECT '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444442', code, CASE WHEN code LIKE 'clinical.%' THEN 'ASSIGNED' ELSE 'TENANT' END
FROM permissions WHERE code IN ('appointments.read','appointments.write','queue.read','queue.manage','patients.read','clinical.read','clinical.write','followups.manage');
--> statement-breakpoint
INSERT INTO role_permissions (tenant_id, role_id, permission_code, scope)
SELECT '11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444443', code, 'TENANT'
FROM permissions WHERE code IN ('appointments.read','appointments.write','appointments.cancel','queue.read','queue.manage','patients.read','patients.write','followups.manage','communications.send');
--> statement-breakpoint
INSERT INTO staff_role_assignments (tenant_id, staff_id, role_id)
VALUES
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333331', '44444444-4444-4444-8444-444444444442'),
  ('11111111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333332', '44444444-4444-4444-8444-444444444443');
--> statement-breakpoint
INSERT INTO services (tenant_id, id, code, name, description, default_duration_minutes, turnover_buffer_minutes, price_paise, booking_mode, instructions)
VALUES
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555501', 'SKIN', 'Skin Consultation', 'Consultation for new or ongoing skin concerns.', 20, 5, 60000, 'PUBLIC', 'Bring previous prescriptions and reports, if available.'),
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555502', 'HAIR', 'Hair Consultation', 'Assessment for hair fall, scalp and hair concerns.', 25, 5, 70000, 'PUBLIC', 'Avoid applying hair oil on the day of consultation.'),
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555503', 'ACNE', 'Acne Consultation', 'Focused acne assessment and follow-up planning.', 20, 5, 60000, 'PUBLIC', 'Bring a list of products currently in use.'),
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555504', 'LASER', 'Laser Treatment Session', 'Scheduled laser treatment session.', 40, 10, NULL, 'STAFF_ONLY', 'Preparation instructions are confirmed by clinic staff.'),
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555505', 'PEEL', 'Chemical Peel', 'Clinician-approved peel session.', 35, 10, NULL, 'STAFF_ONLY', 'Follow the preparation note shared by the clinic.'),
  ('11111111-1111-4111-8111-111111111111', '55555555-5555-4555-8555-555555555506', 'PRP', 'PRP Consultation', 'Suitability and preparation consultation.', 30, 5, 80000, 'PUBLIC', 'Bring relevant recent reports, if any.');
--> statement-breakpoint
INSERT INTO message_templates (tenant_id, id, event_key, channel, locale, body_template)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccc01', 'appointment.confirmed', 'WHATSAPP', 'en-IN', 'Your appointment at Twacha Clinic is confirmed for {{date}} at {{time}}.'),
  ('11111111-1111-4111-8111-111111111111', 'cccccccc-cccc-4ccc-8ccc-cccccccccc02', 'queue.delay', 'SMS', 'en-IN', 'Twacha Clinic is running about {{delay}} minutes late. Your updated arrival time is {{arrivalTime}}.');
--> statement-breakpoint
PRAGMA optimize;
