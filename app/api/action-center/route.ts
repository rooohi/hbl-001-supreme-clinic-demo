import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { loadActionCenter } from "@/server/action-center";
import { aiGatewayStatus } from "@/server/ai-gateway";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const center = await loadActionCenter(getD1(), actor.tenantId, actor.locationId);
    return Response.json({ ...center, ai: aiGatewayStatus() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load the action center");
  }
}
