export async function POST() {
  return Response.json({
    error: "Invoice and product extraction is not connected.",
    code: "AI_EXTRACTION_NOT_CONNECTED",
    reviewRequired: true,
    setup: "Configure an approved document-extraction provider before uploading supplier invoices.",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
