import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

const lineSchema = z.object({
  itemType: z.enum(["SERVICE", "PRODUCT", "PACKAGE", "OTHER"]),
  referenceId: z.string().uuid().nullable().optional().default(null),
  description: z.string().trim().min(1).max(240),
  quantity: z.number().int().min(1).max(999),
  unitPricePaise: z.number().int().min(0).max(100_000_000),
  taxRateBps: z.number().int().min(0).max(10_000).default(0),
});

const createSchema = z.object({
  appointmentId: z.string().uuid(),
  discountPaise: z.number().int().min(0).max(100_000_000).default(0),
  items: z.array(lineSchema).min(1).max(100).optional(),
  action: z.enum(["DRAFT", "ISSUE"]).default("ISSUE"),
});

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const d1 = getD1();
    const invoices = await d1.prepare(`
      SELECT i.id, i.invoice_number AS invoiceNumber, i.status, i.currency,
        i.subtotal_paise AS subtotalPaise, i.discount_paise AS discountPaise,
        i.tax_paise AS taxPaise, i.total_paise AS totalPaise,
        i.paid_paise AS paidPaise, i.balance_paise AS balancePaise,
        i.issued_at_ms AS issuedAt, i.created_at_ms AS createdAt,
        i.appointment_id AS appointmentId, p.display_name AS patientName,
        p.patient_number AS patientNumber, a.service_name_snapshot AS serviceName
      FROM invoices i
      JOIN patients p ON p.tenant_id = i.tenant_id AND p.id = i.patient_id
      LEFT JOIN appointments a ON a.tenant_id = i.tenant_id AND a.id = i.appointment_id
      WHERE i.tenant_id = ?
      ORDER BY i.created_at_ms DESC
      LIMIT 100
    `).bind(actor.tenantId).all<Record<string, unknown>>();

    const ready = await d1.prepare(`
      SELECT a.id AS appointmentId, a.patient_id AS patientId, p.display_name AS patientName,
        p.patient_number AS patientNumber, a.service_id AS serviceId,
        a.service_name_snapshot AS serviceName, a.scheduled_at_ms AS scheduledAt,
        COALESCE(s.price_paise, 0) AS suggestedPricePaise
      FROM appointments a
      JOIN patients p ON p.tenant_id = a.tenant_id AND p.id = a.patient_id
      LEFT JOIN services s ON s.tenant_id = a.tenant_id AND s.id = a.service_id
      LEFT JOIN invoices i ON i.tenant_id = a.tenant_id AND i.appointment_id = a.id AND i.status <> 'VOID'
      WHERE a.tenant_id = ? AND a.location_id = ? AND a.status = 'COMPLETED' AND i.id IS NULL
      ORDER BY a.scheduled_at_ms DESC
      LIMIT 50
    `).bind(actor.tenantId, actor.locationId).all<Record<string, unknown>>();

    return Response.json({ invoices: invoices.results, readyToBill: ready.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load billing");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.write");
    const input = createSchema.parse(await request.json());
    const d1 = getD1();
    const appointment = await d1.prepare(`
      SELECT a.id, a.patient_id AS patientId, a.service_id AS serviceId,
        a.service_name_snapshot AS serviceName, a.status,
        COALESCE(s.price_paise, 0) AS servicePricePaise
      FROM appointments a
      LEFT JOIN services s ON s.tenant_id = a.tenant_id AND s.id = a.service_id
      WHERE a.tenant_id = ? AND a.location_id = ? AND a.id = ? LIMIT 1
    `).bind(actor.tenantId, actor.locationId, input.appointmentId).first<{
      id: string; patientId: string; serviceId: string; serviceName: string; status: string; servicePricePaise: number;
    }>();
    if (!appointment) return Response.json({ error: "Appointment not found" }, { status: 404 });
    if (appointment.status !== "COMPLETED") return Response.json({ error: "Complete the consultation before issuing its bill." }, { status: 409 });

    const existing = await d1.prepare("SELECT id FROM invoices WHERE tenant_id = ? AND appointment_id = ? AND status <> 'VOID' LIMIT 1")
      .bind(actor.tenantId, appointment.id).first<{ id: string }>();
    if (existing) return Response.json({ error: "This encounter already has an active invoice.", invoiceId: existing.id }, { status: 409 });

    const items = input.items ?? [{
      itemType: "SERVICE" as const,
      referenceId: appointment.serviceId,
      description: appointment.serviceName,
      quantity: 1,
      unitPricePaise: appointment.servicePricePaise,
      taxRateBps: 0,
    }];
    const calculated = items.map((item) => {
      const lineSubtotalPaise = item.quantity * item.unitPricePaise;
      const lineTaxPaise = Math.round(lineSubtotalPaise * item.taxRateBps / 10_000);
      return { ...item, lineSubtotalPaise, lineTaxPaise, lineTotalPaise: lineSubtotalPaise + lineTaxPaise };
    });
    const subtotalPaise = calculated.reduce((sum, item) => sum + item.lineSubtotalPaise, 0);
    const taxPaise = calculated.reduce((sum, item) => sum + item.lineTaxPaise, 0);
    if (input.discountPaise > subtotalPaise + taxPaise) return Response.json({ error: "Discount cannot exceed the invoice value." }, { status: 400 });
    const totalPaise = subtotalPaise + taxPaise - input.discountPaise;
    const now = Date.now();
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `TWC-${new Date(now).toISOString().slice(0, 10).replaceAll("-", "")}-${invoiceId.slice(0, 6).toUpperCase()}`;
    const status = input.action === "ISSUE" ? "ISSUED" : "DRAFT";

    const statements = [d1.prepare(`
      INSERT INTO invoices (tenant_id,id,appointment_id,patient_id,invoice_number,status,currency,subtotal_paise,discount_paise,tax_paise,total_paise,paid_paise,balance_paise,issued_at_ms,row_version,created_at_ms,updated_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)
    `).bind(actor.tenantId, invoiceId, appointment.id, appointment.patientId, invoiceNumber, status, "INR",
      subtotalPaise, input.discountPaise, taxPaise, totalPaise, 0, totalPaise,
      input.action === "ISSUE" ? now : null, now, now)];

    calculated.forEach((item, index) => statements.push(d1.prepare(`
      INSERT INTO invoice_items (tenant_id,id,invoice_id,item_type,reference_id,description,quantity,unit_price_paise,tax_rate_bps,line_subtotal_paise,line_tax_paise,line_total_paise,sort_order,created_at_ms,updated_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(actor.tenantId, crypto.randomUUID(), invoiceId, item.itemType, item.referenceId ?? null,
      item.description, item.quantity, item.unitPricePaise, item.taxRateBps, item.lineSubtotalPaise,
      item.lineTaxPaise, item.lineTotalPaise, index, now, now)));

    statements.push(d1.prepare(`
      INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, `invoice.${input.action.toLowerCase()}`,
      "invoice", invoiceId, "SUCCESS", requestId(request), JSON.stringify({ totalPaise, itemCount: items.length }), now));

    await d1.batch(statements);
    return Response.json({ invoiceId, invoiceNumber, status, totalPaise, balancePaise: totalPaise }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to create the invoice");
  }
}
