import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

const paymentSchema = z.object({
  amountPaise: z.number().int().positive().max(100_000_000),
  method: z.enum(["CASH", "UPI", "CARD", "ONLINE", "OTHER"]),
  providerReference: z.string().trim().max(160).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "appointments.write");
    const input = paymentSchema.parse(await request.json());
    const { id } = await params;
    const d1 = getD1();
    const invoice = await d1.prepare(`
      SELECT id, status, total_paise AS totalPaise, paid_paise AS paidPaise,
        balance_paise AS balancePaise, row_version AS rowVersion
      FROM invoices WHERE tenant_id = ? AND id = ? LIMIT 1
    `).bind(actor.tenantId, id).first<{ id: string; status: string; totalPaise: number; paidPaise: number; balancePaise: number; rowVersion: number }>();
    if (!invoice) return Response.json({ error: "Invoice not found" }, { status: 404 });
    if (!["ISSUED", "PARTIALLY_PAID"].includes(invoice.status)) return Response.json({ error: "This invoice cannot accept a payment in its current state." }, { status: 409 });
    if (input.amountPaise > invoice.balancePaise) return Response.json({ error: "Payment exceeds the outstanding amount." }, { status: 400 });

    const now = Date.now();
    const paymentId = crypto.randomUUID();
    const paidPaise = invoice.paidPaise + input.amountPaise;
    const balancePaise = invoice.totalPaise - paidPaise;
    const status = balancePaise === 0 ? "PAID" : "PARTIALLY_PAID";
    await d1.batch([
      d1.prepare(`
        INSERT INTO payments (tenant_id,id,invoice_id,amount_paise,method,status,provider_reference,note,recorded_by_staff_id,recorded_at_ms,created_at_ms,updated_at_ms)
        VALUES (?,?,?,?,?,'RECORDED',?,?,?,?,?,?)
      `).bind(actor.tenantId, paymentId, invoice.id, input.amountPaise, input.method,
        input.providerReference || null, input.note || null, actor.staffId, now, now, now),
      d1.prepare(`
        UPDATE invoices SET status = ?, paid_paise = ?, balance_paise = ?, row_version = row_version + 1, updated_at_ms = ?
        WHERE tenant_id = ? AND id = ? AND row_version = ?
      `).bind(status, paidPaise, balancePaise, now, actor.tenantId, invoice.id, invoice.rowVersion),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "payment.record", "invoice", invoice.id,
        "SUCCESS", requestId(request), JSON.stringify({ amountPaise: input.amountPaise, method: input.method }), now),
    ]);
    return Response.json({ paymentId, invoiceId: invoice.id, status, paidPaise, balancePaise });
  } catch (error) {
    return jsonError(error, "Unable to record the payment");
  }
}
