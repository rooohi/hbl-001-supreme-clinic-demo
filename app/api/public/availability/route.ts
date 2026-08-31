import { getD1 } from "@/db";
import { TWACHA_PROVIDER_ID, TWACHA_TENANT_ID, indiaDayBounds, localDateInIndia, requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { checkPublicRateLimit } from "@/server/patient-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const audience = params.get("audience") ?? "public";
    if (audience !== "public" && audience !== "staff") {
      return Response.json({ error: "Unknown availability audience" }, { status: 400 });
    }
    if (audience === "public") await checkPublicRateLimit(request, "public-availability", 180);
    const date = params.get("date") ?? localDateInIndia();
    const serviceId = params.get("serviceId");
    if (!serviceId) return Response.json({ error: "Choose a service" }, { status: 400 });

    const actor = audience === "staff" ? await requireStaff(request, "appointments.read") : null;
    const tenantId = actor?.tenantId ?? TWACHA_TENANT_ID;
    const providerId = actor?.role === "doctor" ? actor.staffId : TWACHA_PROVIDER_ID;

    const d1 = getD1();
    const service = await d1.prepare(
      "SELECT id,name,default_duration_minutes AS duration,turnover_buffer_minutes AS buffer FROM services WHERE tenant_id = ? AND id = ? AND active = 1 AND (? = 'staff' OR booking_mode = 'PUBLIC') LIMIT 1",
    ).bind(tenantId, serviceId, audience).first<{ id: string; name: string; duration: number; buffer: number }>();
    if (!service) return Response.json({ error: audience === "public" ? "Service is not available for online booking" : "Service is unavailable" }, { status: 404 });

    const day = new Date(`${date}T12:00:00+05:30`).getUTCDay();
    if (day === 0) return Response.json({ date, service, slots: [], closed: true });

    const { start, end } = indiaDayBounds(date);
    const claims = await d1.prepare(
      "SELECT bucket_start_ms AS bucketStart FROM provider_slot_claims WHERE tenant_id = ? AND provider_id = ? AND bucket_start_ms >= ? AND bucket_start_ms < ?",
    ).bind(tenantId, providerId, start, end).all<{ bucketStart: number }>();
    const claimed = new Set(claims.results.map((row: { bucketStart: number }) => row.bucketStart));
    const durationMs = (service.duration + service.buffer) * 60_000;
    const open = start + 660 * 60_000;
    const close = start + 1080 * 60_000;
    const nowFloor = Math.ceil((Date.now() + 900_000) / 600_000) * 600_000;
    const slots: Array<{ time: string; scheduledAt: number }> = [];

    for (let slot = Math.max(open, date === localDateInIndia() ? nowFloor : open); slot + durationMs <= close; slot += 20 * 60_000) {
      let available = true;
      for (let bucket = slot; bucket < slot + durationMs; bucket += 300_000) {
        if (claimed.has(bucket)) { available = false; break; }
      }
      if (available) {
        slots.push({
          scheduledAt: slot,
          time: new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(slot),
        });
      }
      if (slots.length >= 12) break;
    }
    return Response.json({ date, service, slots, closed: false, label: "Calculated from clinic hours and confirmed reservations" });
  } catch (error) {
    return jsonError(error, "Unable to calculate availability");
  }
}
