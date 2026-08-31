# AI roadmap

This roadmap is gated by safety and evidence, not calendar dates. No phase may use real patient data until identity, tenant isolation, encryption, vendor governance, retention, audit, backups, and incident response are approved.

## Phase 0 — deterministic foundation (current)

**Available:** action-center priorities from aggregate operational facts; explicit AI `NOT_CONNECTED` status; schema-gated aggregate brief adapter; inventory extraction disabled.

**Exit evidence:** repeatable fact calculations, no patient fields in the AI payload, schema validation, audit event, timeout/failure state, model-off fallback, and owner-only testing.

## Phase 1 — governance and evaluation harness

Build the control plane before adding capabilities:

- approved provider and data-processing review;
- versioned prompts/schemas, model allow-list, regional/data-retention configuration, and zero-training terms where available;
- request/response redaction, content-size limits, timeouts, budget caps, rate limits, circuit breaker, and kill switch;
- an evaluation set made only from fictional/aggregate clinic scenarios;
- tests for unsupported claims, prompt injection, sensitive-data leakage, malformed output, stale facts, uncertainty, and provider outage;
- audit fields for model/prompt/schema version, fact date, outcome, latency, and reviewer action without storing sensitive prompts;
- named product, security/privacy, and clinical-governance owners.

**Gate:** no clinical content and no autonomous mutation.

## Phase 2 — administrative operations copilot

Pilot high-value, low-risk assistance:

- summarize the deterministic action center into a short owner brief;
- group operational issues by urgency while preserving source evidence;
- draft a staff checklist for the day;
- explain why an aggregate metric changed using only validated facts;
- suggest which existing screen to open next.

Every result remains read-only, evidence-linked, review-required, and disposable. Measure acceptance, overrides, unsupported claims, latency, and time saved against the deterministic interface.

**Gate:** minimum agreed precision, zero sensitive-data leakage in red-team tests, reliable fallback, and explicit human approval before any downstream action.

## Phase 3 — communications drafting, not sending

After WhatsApp/SMS/email consent and provider operations are production-ready, AI may help choose or draft within clinician/legal-approved transactional templates:

- appointment and queue explanations;
- follow-up reminders;
- plain-language administrative FAQs based on an approved clinic knowledge base.

The system must use retrieval from versioned approved content, block symptom/diagnosis/treatment questions, display the exact final message to staff, and require send approval. Emergency or clinical requests route to fixed escalation copy.

**Gate:** template approval, consent/suppression enforcement, multilingual quality review, webhook/retry observability, and message-level audit.

## Phase 4 — document and inventory assistance

Introduce supplier-invoice/product extraction only after private file handling exists:

- malware-scanned private upload;
- OCR/extraction into a draft product/batch/quantity/price structure;
- field-level confidence and source-region evidence;
- mandatory human confirmation before product creation, receipt, or adjustment;
- duplicate invoice/batch detection and arithmetic validation.

Do not use this path for clinical reports or patient documents in this phase.

**Gate:** R2 authorization, retention, deletion, vendor review, extraction accuracy thresholds, and zero autonomous inventory mutations.

## Phase 5 — bounded forecasting and optimization

Only with sufficient clean historical data and stable definitions:

- expected administrative workload ranges;
- stock reorder suggestions with uncertainty and lead-time inputs;
- schedule utilization scenarios and no-show outreach prioritization;
- experiment readouts with confidence limits.

Forecasts must show assumptions, ranges, sample sufficiency, drift, and a deterministic baseline. They cannot allocate care, deny appointments, change prices, or make individual clinical predictions.

## Out of scope without a separate regulated clinical program

- diagnosis, differential diagnosis, image/report interpretation, symptom triage, treatment selection, prescription generation, dose changes, interaction checking, prognosis, or clinical risk scoring;
- autonomous clinical documentation/signing;
- autonomous patient communications about symptoms or treatment;
- model training on patient data;
- any claim of improved clinical outcome without an approved study.

## Required scorecard for every capability

- intended user, decision, data fields, and prohibited data;
- deterministic baseline and reason a model is necessary;
- approval owner and reversible human action;
- offline evaluation and adversarial tests;
- accuracy/coverage, unsupported-claim rate, override rate, leakage incidents, latency, cost, and availability;
- audit/retention policy, kill switch, rollback, and incident procedure;
- post-launch review date and removal threshold.

Failure to meet a gate means the feature remains `NOT_CONNECTED` or is removed; it must not be papered over with optimistic UI copy.
