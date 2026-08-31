import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  title: z.string().trim().min(2).max(120),
  role: z.enum(["Doctor", "Receptionist"]),
});

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "settings.manage");
    const input = inviteSchema.parse(await request.json());
    const d1 = getD1();
    const email = input.email.toLowerCase();
    const existing = await d1.prepare(
      "SELECT id FROM staff_members WHERE tenant_id = ? AND lower(email) = ? LIMIT 1",
    ).bind(actor.tenantId, email).first();
    if (existing) return Response.json({ error: "This email is already part of the clinic team." }, { status: 409 });

    const role = await d1.prepare(
      "SELECT id FROM roles WHERE tenant_id = ? AND name = ? LIMIT 1",
    ).bind(actor.tenantId, input.role).first<{ id: string }>();
    if (!role) return Response.json({ error: "The selected clinic role is unavailable." }, { status: 409 });

    const id = crypto.randomUUID();
    const now = Date.now();
    await d1.batch([
      d1.prepare(`
        INSERT INTO staff_members (tenant_id,id,email,display_name,title,is_provider,status,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,?, 'INVITED',?,?)
      `).bind(actor.tenantId, id, email, input.displayName, input.title, input.role === "Doctor" ? 1 : 0, now, now),
      d1.prepare(`
        INSERT INTO staff_role_assignments (tenant_id,staff_id,role_id,created_at_ms)
        VALUES (?,?,?,?)
      `).bind(actor.tenantId, id, role.id, now),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "staff.invited",
        "staff_member", id, "SUCCESS", requestId(request), JSON.stringify({ role: input.role }), now),
    ]);

    return Response.json({ member: { id, displayName: input.displayName, email, title: input.title, role: input.role, status: "INVITED" } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create staff invitation");
  }
}
