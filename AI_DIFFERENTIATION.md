# AI differentiation

## Position

Twacha Clinic OS does not compete by putting a chatbot on every screen. Its useful differentiation is a clinic-specific operating model: booking constraints, queue state, clinician-controlled notes, follow-up work, billing state, and stock attention are represented as auditable workflow facts. AI is optional and subordinate to that system of record.

This is safer and more valuable than a generic assistant because recommendations can be grounded in explicit operational state, every action still belongs to a human, and the product continues to work when no model is connected.

## What exists today

### Deterministic action center

The action center is not AI. It calculates priorities from stored aggregate facts such as:

- patients waiting or in consultation;
- follow-ups due or overdue;
- completed encounters without an invoice;
- outstanding invoice balances;
- products at/below reorder level or near expiry;
- cancellations and no-shows.

Each item explains why it exists and links to the relevant workflow. This produces reliable assistance without model latency, hallucination, vendor cost, or exposure of patient content.

### Optional aggregate operations brief

The AI gateway is disabled unless `AI_PROVIDER_API_KEY` and `AI_MODEL` are explicitly configured. When enabled for controlled testing, it:

- receives the aggregate action-center fact object, not patient names, contact details, notes, prescriptions, or messages;
- uses a narrow administrative instruction that prohibits diagnosis, prescribing, patient inference, and invented data;
- requires schema-constrained JSON containing a headline, summary, priorities with evidence, and uncertainty;
- validates the response with Zod;
- marks the result as review-required and writes a redacted audit event.

No provider is connected in the default release, so no live AI capability is claimed.

### Explicit non-capabilities

- Inventory invoice/product extraction returns `503 AI_EXTRACTION_NOT_CONNECTED`.
- There is no symptom checker, diagnostic model, autonomous triage, treatment recommender, prescription generator, or automated clinical note finalization.
- There is no patient-facing generative agent, autonomous message sender, or agent that changes appointments, bills, stock, or care records.

## Defensible product advantage

1. **Workflow-grounded context:** assistance is based on normalized appointment, queue, follow-up, invoice, and inventory state rather than a loose chat history.
2. **Deterministic first:** important alerts and calculations do not depend on a model and remain inspectable.
3. **Action boundaries:** the system proposes or links; a permitted staff member executes and remains accountable.
4. **Data minimization:** the first AI use case is aggregate administration, which avoids sending patient content to a model.
5. **Failure transparency:** disconnected providers and parsing failures surface as errors; the product does not fabricate a successful result.
6. **Auditable evolution:** each future AI capability can be gated, evaluated, logged, disabled, and compared against a non-AI baseline.

## Safety contract

AI must never:

- diagnose, prescribe, change dosage, interpret an image/report, or triage an emergency;
- infer sensitive patient facts or expand the purpose of collected data;
- finalize a note, prescription, invoice, payment, message, booking, or stock change;
- hide uncertainty, invent evidence, or present a forecast as measured performance;
- train on clinic data or send it to an unapproved processor;
- operate without a documented owner, approval step, audit event, kill switch, and fallback.

If a request involves symptoms, emergency risk, diagnosis, medication, or treatment, the product must route to a clinician-approved workflow and use fixed safety copy rather than generative advice.

## Measurement

AI should be retained only if it improves a measured administrative outcome against the deterministic baseline, such as time to identify work, priority precision accepted by staff, fewer missed operational tasks, or lower manual summarization time. Track overrides, unsupported recommendations, parse/refusal/failure rate, latency, cost, and any data-policy incident. Revenue uplift or clinical benefit must not be inferred from usage alone.

## Current release statement

The present release demonstrates the boundary and adapter shape, not a connected AI product. The deterministic action center is the usable differentiator today. Any model-enabled pilot remains private, aggregate-only, human-reviewed, and blocked from clinical autonomy.
