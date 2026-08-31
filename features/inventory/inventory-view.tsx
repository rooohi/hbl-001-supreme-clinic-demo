"use client";

import { type FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, Barcode, Boxes, CalendarClock, Check,
  LoaderCircle, PackagePlus, Plus, ScanLine, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { apiJson } from "@/types/clinic";

type Batch = { id: string; batchNumber: string; expiryDate: string | null; quantityOnHand: number; supplierName: string | null };
type Product = {
  id: string; sku: string; name: string; brand: string | null; category: string; unit: string;
  reorderLevel: number; sellingPricePaise: number | null; quantityOnHand: number;
  nearestExpiry: string | null; activeBatches: number; lowStock: boolean; nearExpiry: boolean; expired: boolean;
  batches: Batch[];
};
type InventoryData = {
  products: Product[];
  summary: { products: number; lowStock: number; nearExpiry: number; expired: number };
  extraction: { status: string; reviewRequired: boolean };
};

export function InventoryView() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["inventory"], queryFn: () => apiJson<InventoryData>("/api/inventory") });
  const [panel, setPanel] = useState<"NONE" | "PRODUCT" | "RECEIPT">("NONE");
  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiJson("/api/inventory", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    }),
    onSuccess: async () => { setPanel("NONE"); await queryClient.invalidateQueries({ queryKey: ["inventory"] }); },
  });

  const createProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      action: "CREATE_PRODUCT",
      sku: data.get("sku"), name: data.get("name"), brand: data.get("brand"),
      category: data.get("category"), unit: data.get("unit"), barcode: data.get("barcode"),
      reorderLevel: Number(data.get("reorderLevel") || 0),
      sellingPricePaise: data.get("sellingPrice") ? Math.round(Number(data.get("sellingPrice")) * 100) : null,
      taxRateBps: Math.round(Number(data.get("taxRate") || 0) * 100),
    });
  };

  const receiveStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      action: "RECEIVE_STOCK", productId: data.get("productId"), batchNumber: data.get("batchNumber"),
      expiryDate: data.get("expiryDate") || null, quantity: Number(data.get("quantity")),
      purchasePricePaise: data.get("purchasePrice") ? Math.round(Number(data.get("purchasePrice")) * 100) : null,
      mrpPaise: data.get("mrp") ? Math.round(Number(data.get("mrp")) * 100) : null,
      supplierName: data.get("supplierName"),
    });
  };

  if (query.isLoading) return <div className="panel inventory-loading"><LoaderCircle className="spin" />Loading inventory…</div>;
  if (query.isError || !query.data) return <div className="error-banner"><TriangleAlert />{query.error?.message ?? "Inventory unavailable"}</div>;
  const { products, summary } = query.data;

  return <div className="page-stack inventory-page">
    <section className="page-heading">
      <div><p>Products and consumables</p><h2>Inventory</h2><span>Batch-aware stock, expiry, and reorder attention for clinical and retail items.</span></div>
      <div className="heading-actions"><button type="button" className="secondary-button" aria-expanded={panel === "RECEIPT"} aria-controls="receive-stock-form" onClick={() => setPanel(panel === "RECEIPT" ? "NONE" : "RECEIPT")}><PackagePlus />Receive stock</button><button type="button" className="primary-button" aria-expanded={panel === "PRODUCT"} aria-controls="add-product-form" onClick={() => setPanel(panel === "PRODUCT" ? "NONE" : "PRODUCT")}><Plus />Add product</button></div>
    </section>

    <section className="metric-grid inventory-metrics" aria-label="Inventory summary">
      <article><Boxes /><span><small>Active products</small><b>{summary.products}</b></span></article>
      <article className={summary.lowStock ? "attention" : ""}><AlertTriangle /><span><small>Low stock</small><b>{summary.lowStock}</b></span></article>
      <article className={summary.nearExpiry ? "attention" : ""}><CalendarClock /><span><small>Near expiry · 60 days</small><b>{summary.nearExpiry}</b></span></article>
      <article className={summary.expired ? "danger" : ""}><TriangleAlert /><span><small>Expired batches</small><b>{summary.expired}</b></span></article>
    </section>

    <section className="extraction-status panel" role="note"><ScanLine /><div><b>Invoice and product extraction · not connected</b><p>When an approved provider is configured, uploaded supplier invoices will produce a reviewable draft. Uncertain fields must be confirmed before save.</p></div><span>REVIEW REQUIRED</span></section>

    {panel === "PRODUCT" && <form id="add-product-form" className="panel inventory-form" onSubmit={createProduct}>
      <header><div><p className="eyebrow">NEW CATALOGUE ITEM</p><h3>Add product</h3></div><button type="button" onClick={() => setPanel("NONE")}>Close</button></header>
      <div className="form-grid">
        <label><span>SKU</span><input name="sku" required minLength={2} placeholder="TWC-SERUM-01" /></label>
        <label><span>Name</span><input name="name" required minLength={2} placeholder="Product or material name" /></label>
        <label><span>Brand</span><input name="brand" placeholder="Optional" /></label>
        <label><span>Category</span><select name="category" defaultValue="RETAIL_SKINCARE"><option value="MEDICINE">Medicine</option><option value="RETAIL_SKINCARE">Retail skincare</option><option value="CONSUMABLE">Consumable</option><option value="PROCEDURE_MATERIAL">Procedure material</option><option value="OTHER">Other</option></select></label>
        <label><span>Unit</span><input name="unit" defaultValue="unit" required /></label>
        <label><span>Barcode</span><div className="input-with-icon"><Barcode /><input name="barcode" placeholder="Optional" /></div></label>
        <label><span>Reorder at</span><input name="reorderLevel" type="number" min={0} defaultValue={5} required /></label>
        <label><span>Selling price ₹</span><input name="sellingPrice" type="number" min={0} step="0.01" /></label>
        <label><span>GST %</span><input name="taxRate" type="number" min={0} max={100} step="0.01" defaultValue={0} /></label>
      </div>
      <footer><button type="button" className="secondary-button" onClick={() => setPanel("NONE")}>Cancel</button><button type="submit" className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="spin" /> : <Check />}Review and save</button></footer>
    </form>}

    {panel === "RECEIPT" && <form id="receive-stock-form" className="panel inventory-form" onSubmit={receiveStock}>
      <header><div><p className="eyebrow">STOCK RECEIPT</p><h3>Receive a batch</h3></div><button type="button" onClick={() => setPanel("NONE")}>Close</button></header>
      <div className="form-grid">
        <label className="full"><span>Product</span><select name="productId" required defaultValue=""><option value="" disabled>Choose product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label>
        <label><span>Batch number</span><input name="batchNumber" required /></label>
        <label><span>Expiry date</span><input name="expiryDate" type="date" /></label>
        <label><span>Quantity received</span><input name="quantity" type="number" min={1} required /></label>
        <label><span>Purchase price ₹</span><input name="purchasePrice" type="number" min={0} step="0.01" /></label>
        <label><span>MRP ₹</span><input name="mrp" type="number" min={0} step="0.01" /></label>
        <label><span>Supplier</span><input name="supplierName" /></label>
      </div>
      <footer><button type="button" className="secondary-button" onClick={() => setPanel("NONE")}>Cancel</button><button type="submit" className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="spin" /> : <Check />}Confirm receipt</button></footer>
    </form>}

    {mutation.isError && <div className="error-banner"><TriangleAlert />{mutation.error.message}</div>}
    {mutation.isSuccess && <div className="success-banner"><Check />Inventory updated and audited.</div>}

    <section className="panel inventory-table">
      <header><span>Product</span><span>Stock</span><span>Batch / expiry</span><span>Price</span><span>Attention</span></header>
      {products.map((product) => <article key={product.id}>
        <span className="inventory-product"><i><Boxes /></i><span><b>{product.name}</b><small>{product.sku} · {product.brand ?? product.category.replaceAll("_", " ").toLowerCase()}</small></span></span>
        <span><b>{product.quantityOnHand}</b><small>{product.unit}{product.quantityOnHand === 1 ? "" : "s"} · reorder at {product.reorderLevel}</small></span>
        <span><b>{product.activeBatches} active</b><small>{product.nearestExpiry ? `Nearest ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(`${product.nearestExpiry}T00:00:00Z`))}` : "No expiry recorded"}</small></span>
        <span><b>{product.sellingPricePaise == null ? "Not set" : `₹${(product.sellingPricePaise / 100).toLocaleString("en-IN")}`}</b><small>per {product.unit}</small></span>
        <span className="inventory-alerts">{product.expired ? <em className="danger">Expired</em> : product.nearExpiry ? <em className="warning">Near expiry</em> : null}{product.lowStock ? <em className="warning">Low stock</em> : !product.expired && !product.nearExpiry ? <em className="healthy">Healthy</em> : null}</span>
      </article>)}
      {!products.length && <div className="empty-state"><Boxes /><h3>No inventory yet</h3><p>Add the first product, then receive a batch. AI extraction remains off until an approved provider is connected.</p></div>}
    </section>
    <div className="privacy-note"><ShieldCheck /><p><b>Human-reviewed stock control</b><span>No product extraction, adjustment, order, or charge is committed without an authorized staff action.</span></p></div>
  </div>;
}
