import { z } from "zod";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

const createProductSchema = z.object({
  action: z.literal("CREATE_PRODUCT"),
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(180),
  brand: z.string().trim().max(120).optional().default(""),
  category: z.enum(["MEDICINE", "RETAIL_SKINCARE", "CONSUMABLE", "PROCEDURE_MATERIAL", "OTHER"]),
  unit: z.string().trim().min(1).max(40).default("unit"),
  barcode: z.string().trim().max(80).optional().default(""),
  reorderLevel: z.number().int().min(0).max(1_000_000).default(0),
  sellingPricePaise: z.number().int().min(0).max(100_000_000).nullable().optional().default(null),
  taxRateBps: z.number().int().min(0).max(10_000).default(0),
});

const receiveSchema = z.object({
  action: z.literal("RECEIVE_STOCK"),
  productId: z.string().uuid(),
  batchNumber: z.string().trim().min(1).max(100),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().default(null),
  quantity: z.number().int().positive().max(1_000_000),
  purchasePricePaise: z.number().int().min(0).max(100_000_000).nullable().optional().default(null),
  mrpPaise: z.number().int().min(0).max(100_000_000).nullable().optional().default(null),
  supplierName: z.string().trim().max(180).optional().default(""),
});

const adjustSchema = z.object({
  action: z.literal("ADJUST_STOCK"),
  productId: z.string().uuid(),
  batchId: z.string().uuid(),
  quantityDelta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0),
  reason: z.string().trim().min(3).max(500),
});

const mutationSchema = z.discriminatedUnion("action", [createProductSchema, receiveSchema, adjustSchema]);

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "patients.read");
    const d1 = getD1();
    const products = await d1.prepare(`
      SELECT p.id, p.sku, p.name, p.brand, p.category, p.unit, p.barcode,
        p.reorder_level AS reorderLevel, p.selling_price_paise AS sellingPricePaise,
        p.tax_rate_bps AS taxRateBps, p.active,
        COALESCE(SUM(b.quantity_on_hand), 0) AS quantityOnHand,
        MIN(CASE WHEN b.quantity_on_hand > 0 THEN b.expiry_date END) AS nearestExpiry,
        COUNT(CASE WHEN b.quantity_on_hand > 0 THEN 1 END) AS activeBatches
      FROM inventory_products p
      LEFT JOIN inventory_batches b ON b.tenant_id = p.tenant_id AND b.product_id = p.id
      WHERE p.tenant_id = ? AND p.active = 1
      GROUP BY p.tenant_id, p.id
      ORDER BY CASE WHEN COALESCE(SUM(b.quantity_on_hand), 0) <= p.reorder_level THEN 0 ELSE 1 END,
        p.name
      LIMIT 300
    `).bind(actor.tenantId).all<Record<string, unknown>>();

    const batches = await d1.prepare(`
      SELECT b.id, b.product_id AS productId, b.batch_number AS batchNumber,
        b.expiry_date AS expiryDate, b.quantity_on_hand AS quantityOnHand,
        b.purchase_price_paise AS purchasePricePaise, b.mrp_paise AS mrpPaise,
        b.supplier_name AS supplierName, b.received_at_ms AS receivedAt
      FROM inventory_batches b
      JOIN inventory_products p ON p.tenant_id = b.tenant_id AND p.id = b.product_id
      WHERE b.tenant_id = ? AND p.active = 1
      ORDER BY b.expiry_date IS NULL, b.expiry_date, b.received_at_ms DESC
      LIMIT 600
    `).bind(actor.tenantId).all<Record<string, unknown>>();

    const today = new Date().toISOString().slice(0, 10);
    const soon = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    const productRows = products.results.map((product) => ({
      ...product,
      quantityOnHand: Number(product.quantityOnHand),
      reorderLevel: Number(product.reorderLevel),
      lowStock: Number(product.quantityOnHand) <= Number(product.reorderLevel),
      nearExpiry: Boolean(product.nearestExpiry && String(product.nearestExpiry) >= today && String(product.nearestExpiry) <= soon),
      expired: Boolean(product.nearestExpiry && String(product.nearestExpiry) < today),
      batches: batches.results.filter((batch) => batch.productId === product.id),
    }));
    return Response.json({
      products: productRows,
      summary: {
        products: productRows.length,
        lowStock: productRows.filter((item) => item.lowStock).length,
        nearExpiry: productRows.filter((item) => item.nearExpiry).length,
        expired: productRows.filter((item) => item.expired).length,
      },
      extraction: { status: "NOT_CONNECTED", reviewRequired: true },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load inventory");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff(request, "patients.write");
    const input = mutationSchema.parse(await request.json());
    const d1 = getD1();
    const now = Date.now();

    if (input.action === "CREATE_PRODUCT") {
      const id = crypto.randomUUID();
      await d1.batch([
        d1.prepare(`
          INSERT INTO inventory_products (tenant_id,id,sku,name,brand,category,unit,barcode,reorder_level,selling_price_paise,tax_rate_bps,active,created_at_ms,updated_at_ms)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,1,?,?)
        `).bind(actor.tenantId, id, input.sku, input.name, input.brand || null, input.category,
          input.unit, input.barcode || null, input.reorderLevel, input.sellingPricePaise, input.taxRateBps, now, now),
        d1.prepare(`
          INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "inventory.product_create", "inventory_product", id,
          "SUCCESS", requestId(request), JSON.stringify({ category: input.category }), now),
      ]);
      return Response.json({ id, action: input.action }, { status: 201 });
    }

    const product = await d1.prepare("SELECT id FROM inventory_products WHERE tenant_id = ? AND id = ? AND active = 1 LIMIT 1")
      .bind(actor.tenantId, input.productId).first<{ id: string }>();
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 });

    if (input.action === "RECEIVE_STOCK") {
      const existing = await d1.prepare("SELECT id FROM inventory_batches WHERE tenant_id = ? AND product_id = ? AND batch_number = ? LIMIT 1")
        .bind(actor.tenantId, input.productId, input.batchNumber).first<{ id: string }>();
      const batchId = existing?.id ?? crypto.randomUUID();
      await d1.batch([
        d1.prepare(`
          INSERT INTO inventory_batches (tenant_id,id,product_id,batch_number,expiry_date,quantity_on_hand,purchase_price_paise,mrp_paise,supplier_name,received_at_ms,created_at_ms,updated_at_ms)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(tenant_id,product_id,batch_number) DO UPDATE SET
            expiry_date = excluded.expiry_date,
            quantity_on_hand = inventory_batches.quantity_on_hand + excluded.quantity_on_hand,
            purchase_price_paise = excluded.purchase_price_paise,
            mrp_paise = excluded.mrp_paise,
            supplier_name = excluded.supplier_name,
            received_at_ms = excluded.received_at_ms,
            updated_at_ms = excluded.updated_at_ms
        `).bind(actor.tenantId, batchId, input.productId, input.batchNumber, input.expiryDate,
          input.quantity, input.purchasePricePaise, input.mrpPaise, input.supplierName || null, now, now, now),
        d1.prepare(`
          INSERT INTO stock_movements (tenant_id,id,product_id,batch_id,movement_type,quantity_delta,reason,actor_staff_id,occurred_at_ms)
          VALUES (?,?,?,?,?,?,?,?,?)
        `).bind(actor.tenantId, crypto.randomUUID(), input.productId, batchId, "RECEIPT", input.quantity, "Stock receipt", actor.staffId, now),
        d1.prepare(`
          INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "inventory.receive", "inventory_batch", batchId,
          "SUCCESS", requestId(request), JSON.stringify({ quantity: input.quantity }), now),
      ]);
      return Response.json({ batchId, action: input.action });
    }

    const batch = await d1.prepare("SELECT id, quantity_on_hand AS quantityOnHand FROM inventory_batches WHERE tenant_id = ? AND id = ? AND product_id = ? LIMIT 1")
      .bind(actor.tenantId, input.batchId, input.productId).first<{ id: string; quantityOnHand: number }>();
    if (!batch) return Response.json({ error: "Stock batch not found" }, { status: 404 });
    if (batch.quantityOnHand + input.quantityDelta < 0) return Response.json({ error: "Adjustment would make stock negative." }, { status: 409 });
    await d1.batch([
      d1.prepare("UPDATE inventory_batches SET quantity_on_hand = quantity_on_hand + ?, updated_at_ms = ? WHERE tenant_id = ? AND id = ? AND quantity_on_hand + ? >= 0")
        .bind(input.quantityDelta, now, actor.tenantId, batch.id, input.quantityDelta),
      d1.prepare(`
        INSERT INTO stock_movements (tenant_id,id,product_id,batch_id,movement_type,quantity_delta,reason,actor_staff_id,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), input.productId, batch.id, "ADJUSTMENT", input.quantityDelta, input.reason, actor.staffId, now),
      d1.prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "inventory.adjust", "inventory_batch", batch.id,
        "SUCCESS", requestId(request), JSON.stringify({ quantityDelta: input.quantityDelta }), now),
    ]);
    return Response.json({ batchId: batch.id, action: input.action });
  } catch (error) {
    return jsonError(error, "Unable to update inventory");
  }
}
