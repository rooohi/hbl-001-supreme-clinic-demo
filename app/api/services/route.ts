import { getD1 } from "@/db";
import { TWACHA_TENANT_ID, requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { z } from "zod";

export const dynamic = "force-dynamic";

const serviceSchema = z.object({
  code: z.string().trim().min(2).max(24).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().default(""),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  bufferMinutes: z.coerce.number().int().min(0).max(120).default(0),
  priceRupees: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  bookingMode: z.enum(["PUBLIC", "STAFF_ONLY", "REFERRAL"]),
  instructions: z.string().trim().max(500).optional().default(""),
});

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

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "settings.manage");
    const input = serviceSchema.parse(await request.json());
    const d1 = getD1();
    const code = input.code.toUpperCase();
    const existing = await d1.prepare(
      "SELECT id FROM services WHERE tenant_id = ? AND (upper(code) = ? OR lower(name) = lower(?)) LIMIT 1",
    ).bind(actor.tenantId, code, input.name).first();
    if (existing) return Response.json({ error: "A service with this code or name already exists." }, { status: 409 });

    const id = crypto.randomUUID();
    const now = Date.now();
    const pricePaise = input.priceRupees == null ? null : Math.round(input.priceRupees * 100);
    await d1.batch([
      d1.prepare(`
        INSERT INTO services (
          tenant_id,id,code,name,description,default_duration_minutes,turnover_buffer_minutes,
          price_paise,currency,booking_mode,instructions,active,created_at_ms,updated_at_ms
        ) VALUES (?,?,?,?,?,?,?,?,? ,?,?,1,?,?)
      `).bind(actor.tenantId, id, code, input.name, input.description || null,
        input.durationMinutes, input.bufferMinutes, pricePaise, "INR", input.bookingMode,
        input.instructions || null, now, now),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "service.created",
        "service", id, "SUCCESS", requestId(request), JSON.stringify({ code, bookingMode: input.bookingMode }), now),
    ]);
    return Response.json({ service: { id, code, name: input.name, bookingMode: input.bookingMode } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create service");
  }
}
