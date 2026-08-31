import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";
import { loadActionCenter } from "@/server/action-center";
import { aiGatewayStatus, generateOperationalBrief } from "@/server/ai-gateway";

export async function GET(request: Request) {
  try {
    await requireStaff(request, "appointments.read");
    return Response.json(aiGatewayStatus(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to check the AI gateway");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    if (aiGatewayStatus().status !== "CONNECTED") {
      return Response.json({ error: "AI gateway is not connected", code: "AI_NOT_CONNECTED", status: aiGatewayStatus() }, { status: 503 });
    }
    const { facts } = await loadActionCenter(getD1(), actor.tenantId, actor.locationId);
    const brief = await generateOperationalBrief(facts);
    const now = Date.now();
    await getD1().prepare(`
      INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,outcome,request_id,metadata_redacted_json,occurred_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "ai.operational_brief_generate", "aggregate_operational_facts", "SUCCESS", requestId(request), JSON.stringify({ date: facts.date, patientDataIncluded: false }), now).run();
    return Response.json({ brief, factsDate: facts.date, generatedAt: now, reviewRequired: true });
  } catch (error) {
    return jsonError(error, "Unable to generate the AI brief");
  }
}
