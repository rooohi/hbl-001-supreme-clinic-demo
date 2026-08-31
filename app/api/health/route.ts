import { getD1 } from "@/db";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await getD1().prepare("SELECT 1 AS ok").first<{ ok: number }>();
    return Response.json({ status: result?.ok === 1 ? "healthy" : "degraded", checks: { database: "ok" } });
  } catch (error) {
    return jsonError(error, "Health check failed");
  }
}
