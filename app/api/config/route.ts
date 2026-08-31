import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const d1 = getD1();
    const [location, team, templates] = await Promise.all([
      d1.prepare(`SELECT name,timezone,address,phone_e164 AS phone,opens_minute AS opensMinute,closes_minute AS closesMinute,working_days_json AS workingDays,status FROM locations WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, actor.locationId).first(),
      d1.prepare(`SELECT id,display_name AS displayName,email,title,is_provider AS isProvider,status,last_login_at_ms AS lastLoginAt FROM staff_members WHERE tenant_id = ? ORDER BY is_provider DESC,display_name`).bind(actor.tenantId).all(),
      d1.prepare(`SELECT id,event_key AS eventKey,channel,locale,body_template AS bodyTemplate,active FROM message_templates WHERE tenant_id = ? ORDER BY event_key,channel`).bind(actor.tenantId).all(),
    ]);
    return Response.json({
      clinic: { name: "Twacha Skin • Hair • Laser • Cosmetology Centre", doctor: "Dr. Suman Odugoudar Dibbad", ...location },
      team: team.results,
      templates: templates.results,
      providers: [
        { channel: "WhatsApp", status: "NOT_CONFIGURED" },
        { channel: "SMS", status: "NOT_CONFIGURED" },
        { channel: "Email", status: "NOT_CONFIGURED" },
        { channel: "Web", status: "DEVELOPMENT" },
      ],
      storage: { database: "D1_CONNECTED", files: "NOT_IMPLEMENTED", publicBucketUrls: false },
    });
  } catch (error) {
    return jsonError(error, "Unable to load clinic configuration");
  }
}
