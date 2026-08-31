import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { getWhatsAppConfigurationHealth } from "@/server/integrations/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireStaff(request, "settings.manage");
    const health = getWhatsAppConfigurationHealth();
    return Response.json(health, {
      status: health.configured ? 200 : 503,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    return jsonError(error, "Unable to inspect the WhatsApp integration");
  }
}
