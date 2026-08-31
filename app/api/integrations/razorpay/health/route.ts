import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { getRazorpayConfigurationHealth } from "@/server/integrations/razorpay";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireStaff(request, "settings.manage");
    const health = getRazorpayConfigurationHealth();
    return Response.json(health, {
      status: health.configured ? 200 : 503,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    return jsonError(error, "Unable to inspect the Razorpay integration");
  }
}
