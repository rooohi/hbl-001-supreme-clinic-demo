import { env } from "cloudflare:workers";
import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError, requestId } from "@/server/http";

export const dynamic = "force-dynamic";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxBytes = 5 * 1024 * 1024;

function safeName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 100) || "document";
}

async function patientExists(tenantId: string, patientId: string) {
  return Boolean(await getD1().prepare(
    "SELECT 1 AS ok FROM patients WHERE tenant_id = ? AND id = ? AND status = 'ACTIVE' LIMIT 1",
  ).bind(tenantId, patientId).first());
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "patients.read");
    const { id } = await params;
    if (!await patientExists(actor.tenantId, id)) return Response.json({ error: "Patient record not found" }, { status: 404 });
    const prefix = `${actor.tenantId}/patients/${id}/documents/`;
    const key = new URL(request.url).searchParams.get("key");
    if (key) {
      if (!key.startsWith(prefix)) return Response.json({ error: "Invalid document key" }, { status: 400 });
      const object = await env.FILES.get(key);
      if (!object) return Response.json({ error: "Document not found" }, { status: 404 });
      const name = safeName(object.customMetadata?.originalName ?? key.split("/").at(-1) ?? "document");
      return new Response(object.body, { headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
      } });
    }

    const listed = await env.FILES.list({ prefix, include: ["customMetadata", "httpMetadata"] });
    return Response.json({ documents: listed.objects.map((object) => ({
      key: object.key,
      name: object.customMetadata?.originalName ?? object.key.split("/").at(-1) ?? "Document",
      size: object.size,
      uploadedAt: object.uploaded.getTime(),
      contentType: object.httpMetadata?.contentType ?? "application/octet-stream",
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load patient documents");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "patients.write");
    const { id } = await params;
    if (!await patientExists(actor.tenantId, id)) return Response.json({ error: "Patient record not found" }, { status: 404 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a PDF, JPEG, or PNG document." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return Response.json({ error: "Only PDF, JPEG, and PNG documents are allowed." }, { status: 400 });
    if (file.size <= 0 || file.size > maxBytes) return Response.json({ error: "Document size must be between 1 byte and 5 MB." }, { status: 400 });
    if (form.get("consentConfirmed") !== "true") return Response.json({ error: "Confirm patient consent before uploading a private document." }, { status: 400 });

    const now = Date.now();
    const key = `${actor.tenantId}/patients/${id}/documents/${now}-${crypto.randomUUID()}-${safeName(file.name)}`;
    await env.FILES.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name.slice(0, 180), patientId: id, uploadedBy: actor.staffId },
    });
    await getD1().batch([
      getD1().prepare(`
        INSERT INTO consent_records (tenant_id,id,patient_id,purpose,status,policy_version,source,captured_at_ms)
        VALUES (?,?,?,'DOCUMENT_STORAGE','GRANTED','twacha-private-docs-v1','STAFF_RECORDED',?)
      `).bind(actor.tenantId, crypto.randomUUID(), id, now),
      getD1().prepare(`
        INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
      `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "patient_document.uploaded",
        "patient", id, "SUCCESS", requestId(request), JSON.stringify({ contentType: file.type, size: file.size }), now),
    ]);
    return Response.json({ document: { key, name: file.name, size: file.size, uploadedAt: now, contentType: file.type } }, { status: 201 });
  } catch (error) {
    return jsonError(error, "Unable to upload patient document");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(request, "patients.write");
    const { id } = await params;
    const prefix = `${actor.tenantId}/patients/${id}/documents/`;
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!key.startsWith(prefix)) return Response.json({ error: "Invalid document key" }, { status: 400 });
    await env.FILES.delete(key);
    const now = Date.now();
    await getD1().prepare(`
      INSERT INTO audit_logs (tenant_id,id,actor_type,actor_id,action,entity_type,entity_id,outcome,request_id,metadata_redacted_json,occurred_at_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).bind(actor.tenantId, crypto.randomUUID(), "STAFF", actor.staffId, "patient_document.deleted",
      "patient", id, "SUCCESS", requestId(request), "{}", now).run();
    return Response.json({ deleted: true });
  } catch (error) {
    return jsonError(error, "Unable to delete patient document");
  }
}
