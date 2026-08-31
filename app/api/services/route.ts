import { getD1 } from "@/db";
import { TWACHA_TENANT_ID, requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const audience = new URL(request.url).searchParams.get("audience") ?? "staff";
    if (audience !== "public" && audience !== "staff") {
      return Response.json({ error: "Unknown service audience" }, { status: 400 });
    }

    const tenantId = audience === "staff"
      ? (await requireStaff(request, "appointments.read")).tenantId
      : TWACHA_TENANT_ID;
    const result = await getD1().prepare(`
      SELECT id, code, name, description, default_duration_minutes AS durationMinutes,
        turnover_buffer_minutes AS bufferMinutes, price_paise AS pricePaise,
        currency, booking_mode AS bookingMode, instructions
      FROM services
      WHERE tenant_id = ? AND active = 1
        AND (? = 'staff' OR booking_mode = 'PUBLIC')
      ORDER BY name
    `).bind(tenantId, audience).all();
    return Response.json({ services: result.results });
  } catch (error) {
    return jsonError(error, "Unable to load clinic services");
  }
}
