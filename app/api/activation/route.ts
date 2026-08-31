import { getD1 } from "@/db";
import { requireStaff } from "@/server/clinic-context";
import { jsonError } from "@/server/http";
import { aiGatewayStatus } from "@/server/ai-gateway";

export async function GET(request: Request) {
  try {
    const actor = await requireStaff(request, "appointments.read");
    const d1 = getD1();
    const facts = await d1.prepare(`
      SELECT
        t.display_name AS clinicName,
        l.name AS locationName, l.address, l.phone_e164 AS phone,
        l.opens_minute AS opensMinute, l.closes_minute AS closesMinute,
        (SELECT COUNT(*) FROM services WHERE tenant_id = t.id AND active = 1) AS serviceCount,
        (SELECT COUNT(*) FROM staff_members WHERE tenant_id = t.id AND status = 'ACTIVE') AS staffCount,
        (SELECT COUNT(*) FROM staff_members WHERE tenant_id = t.id AND status = 'ACTIVE' AND is_provider = 1) AS providerCount,
        (SELECT COUNT(*) FROM staff_members WHERE tenant_id = t.id AND status = 'ACTIVE' AND email NOT LIKE '%.example') AS verifiedEmailCount,
        (SELECT COUNT(*) FROM appointments WHERE tenant_id = t.id AND idempotency_key LIKE 'seed-appointment-%') AS demoAppointmentCount,
        (SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name IN ('prescriptions','invoices','inventory_products','patient_access_tokens')) AS coreTableCount
      FROM tenants t
      JOIN locations l ON l.tenant_id = t.id AND l.id = ?
      WHERE t.id = ? LIMIT 1
    `).bind(actor.locationId, actor.tenantId).first<Record<string, string | number | null>>();
    if (!facts) return Response.json({ error: "Clinic activation record not found" }, { status: 404 });

    const contactReady = Boolean(facts.phone && facts.address && !String(facts.address).toLowerCase().includes("confirm"));
    const identityReady = Number(facts.verifiedEmailCount ?? 0) > 0 || Boolean(process.env.BOOTSTRAP_OWNER_EMAILS?.trim());
    const whatsappReady = Boolean(process.env.WHATSAPP_PROVIDER_TOKEN);
    const razorpayReady = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET);
    const privacyReady = Boolean(process.env.PII_KEY_REF);
    const demoClear = Number(facts.demoAppointmentCount ?? 0) === 0;
    const coreReady = Number(facts.coreTableCount ?? 0) === 4;
    const steps = [
      { key: "clinic", label: "Clinic information", detail: contactReady ? "Verified contact and location are present." : "Confirm the real address and phone before any patient launch.", status: contactReady ? "COMPLETE" : "BLOCKED", href: "/settings" },
      { key: "staff", label: "Verified staff identity", detail: identityReady ? "At least one non-placeholder owner/staff identity is configured." : "Replace placeholder staff emails or configure a bootstrap owner.", status: identityReady ? "COMPLETE" : "BLOCKED", href: "/team" },
      { key: "services", label: "Doctor and services", detail: `${facts.providerCount} provider and ${facts.serviceCount} active services configured.`, status: Number(facts.providerCount) > 0 && Number(facts.serviceCount) > 0 ? "COMPLETE" : "BLOCKED", href: "/services" },
      { key: "clinical", label: "Clinical and checkout core", detail: coreReady ? "Consultation, prescription, billing, inventory, and protected-status tables are present." : "Required clinical-commerce migrations are missing.", status: coreReady ? "COMPLETE" : "BLOCKED", href: "/consultations" },
      { key: "privacy", label: "Privacy key and approval", detail: privacyReady ? "A production patient-data key reference is configured." : "PII_KEY_REF and the approved privacy/retention procedure are required.", status: privacyReady ? "COMPLETE" : "BLOCKED", href: "/settings" },
      { key: "whatsapp", label: "Official communications", detail: whatsappReady ? "A provider token is present; live templates/webhooks still require verification." : "Official WhatsApp/SMS/email is not connected.", status: whatsappReady ? "READY_TO_VERIFY" : "BLOCKED", href: "/messages" },
      { key: "payments", label: "Razorpay and reconciliation", detail: razorpayReady ? "Server credentials and webhook secret are present; webhook verification is next." : "Razorpay remains not connected; cash/UPI/card recording works locally.", status: razorpayReady ? "READY_TO_VERIFY" : "BLOCKED", href: "/billing" },
      { key: "demo", label: "Demo data cleared", detail: demoClear ? "No seeded appointment records remain." : `${facts.demoAppointmentCount} development appointments remain in this local workspace.`, status: demoClear ? "COMPLETE" : "BLOCKED", href: "/patients" },
      { key: "ai", label: "AI gateway", detail: aiGatewayStatus().status === "CONNECTED" ? "Aggregate operational brief generation is connected for controlled testing." : "Optional: AI remains explicitly not connected; deterministic operations continue.", status: aiGatewayStatus().status === "CONNECTED" ? "READY_TO_VERIFY" : "OPTIONAL", href: "/action-center" },
    ] as const;
    const required = steps.filter((step) => step.status !== "OPTIONAL");
    const complete = required.filter((step) => step.status === "COMPLETE").length;
    const blockers = required.filter((step) => step.status === "BLOCKED").length;
    return Response.json({
      clinic: facts,
      steps,
      progress: { complete, total: required.length, percent: Math.round(complete / required.length * 100), blockers },
      activation: { status: blockers === 0 && required.every((step) => step.status === "COMPLETE") ? "READY_FOR_APPROVAL" : "BLOCKED", publicLaunchAllowed: false },
      note: "Public launch remains a human approval after deployed end-to-end, security, backup, and provider verification.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error, "Unable to load clinic activation");
  }
}
