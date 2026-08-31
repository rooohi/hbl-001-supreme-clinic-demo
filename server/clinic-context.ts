export const TWACHA_TENANT_ID = "11111111-1111-4111-8111-111111111111";
export const TWACHA_LOCATION_ID = "22222222-2222-4222-8222-222222222222";
export const TWACHA_PROVIDER_ID = "33333333-3333-4333-8333-333333333331";
export const TWACHA_TIMEZONE = "Asia/Kolkata";

export const STAFF_PERMISSIONS = {
  doctor: new Set([
    "appointments.read", "appointments.write", "queue.read", "queue.manage",
    "patients.read", "clinical.read", "clinical.write", "followups.manage",
  ]),
  receptionist: new Set([
    "appointments.read", "appointments.write", "appointments.cancel", "queue.read",
    "queue.manage", "patients.read", "patients.write", "followups.manage",
    "communications.send",
  ]),
  owner: new Set(["*"]),
} as const;

export type StaffRole = keyof typeof STAFF_PERMISSIONS;

export type StaffContext = {
  tenantId: string;
  locationId: string;
  staffId: string;
  email: string;
  displayName: string;
  role: StaffRole;
};

export async function requireStaff(request: Request, permission: string): Promise<StaffContext> {
  const email = request.headers.get("oai-authenticated-user-email");
  const requestedDevRole = request.headers.get("x-twacha-dev-role") as StaffRole | null;
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment && !email) {
    const role: StaffRole = requestedDevRole && requestedDevRole in STAFF_PERMISSIONS ? requestedDevRole : "doctor";
    const grants = STAFF_PERMISSIONS[role];
    if (!grants.has("*") && !grants.has(permission)) {
      throw Response.json({ error: "Insufficient permission", code: "FORBIDDEN" }, { status: 403 });
    }
    return {
      tenantId: TWACHA_TENANT_ID,
      locationId: TWACHA_LOCATION_ID,
      staffId: role === "receptionist" ? "33333333-3333-4333-8333-333333333332" : TWACHA_PROVIDER_ID,
      email: `${role}@twacha.local`,
      displayName: role === "receptionist" ? "Kavya Shetty" : role === "owner" ? "Twacha Clinic Owner" : "Dr. Suman Odugoudar Dibbad",
      role,
    };
  }

  if (!email) throw Response.json({ error: "Authentication required", code: "AUTH_REQUIRED" }, { status: 401 });

  const bootstrapOwners = (process.env.BOOTSTRAP_OWNER_EMAILS ?? "")
    .split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (bootstrapOwners.includes(email.toLowerCase())) {
    return {
      tenantId: TWACHA_TENANT_ID,
      locationId: TWACHA_LOCATION_ID,
      staffId: `bootstrap-owner:${email.toLowerCase()}`,
      email,
      displayName: "Twacha Clinic Owner",
      role: "owner",
    };
  }

  const rows = await getD1().prepare(`
    SELECT sm.id AS staffId, sm.email, sm.display_name AS displayName, sm.is_provider AS isProvider,
      r.name AS roleName, rp.permission_code AS permissionCode
    FROM staff_members sm
    JOIN staff_role_assignments sra ON sra.tenant_id = sm.tenant_id AND sra.staff_id = sm.id
    JOIN roles r ON r.tenant_id = sra.tenant_id AND r.id = sra.role_id
    LEFT JOIN role_permissions rp ON rp.tenant_id = r.tenant_id AND rp.role_id = r.id
    WHERE sm.tenant_id = ? AND lower(sm.email) = lower(?) AND sm.status = 'ACTIVE'
  `).bind(TWACHA_TENANT_ID, email).all<{ staffId: string; email: string; displayName: string; isProvider: number; roleName: string; permissionCode: string | null }>();
  if (!rows.results.length) {
    throw Response.json({ error: "Your identity is not an active member of this clinic.", code: "STAFF_MEMBERSHIP_REQUIRED" }, { status: 403 });
  }
  const permissionSet = new Set(rows.results.map((row) => row.permissionCode).filter((code): code is string => Boolean(code)));
  const roleNames = rows.results.map((row) => row.roleName.toLowerCase());
  const role: StaffRole = roleNames.some((name) => name.includes("owner"))
    ? "owner"
    : roleNames.some((name) => name.includes("reception")) ? "receptionist" : "doctor";
  const grants = role === "owner" ? STAFF_PERMISSIONS.owner : permissionSet;

  if (!grants.has("*") && !grants.has(permission)) {
    throw Response.json({ error: "Insufficient permission", code: "FORBIDDEN" }, { status: 403 });
  }

  return {
    tenantId: TWACHA_TENANT_ID,
    locationId: TWACHA_LOCATION_ID,
    staffId: rows.results[0].staffId,
    email: rows.results[0].email,
    displayName: rows.results[0].displayName,
    role,
  };
}

export function localDateInIndia(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TWACHA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function indiaDayBounds(localDate: string) {
  const start = Date.parse(`${localDate}T00:00:00+05:30`);
  return { start, end: start + 86_400_000 };
}

export function parseIndiaDateTime(localDate: string, localTime: string) {
  const value = Date.parse(`${localDate}T${localTime}:00+05:30`);
  if (!Number.isFinite(value)) throw new Error("Invalid appointment date or time");
  return value;
}
import { getD1 } from "@/db";
