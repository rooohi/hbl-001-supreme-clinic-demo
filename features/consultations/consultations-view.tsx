"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck, BrainCircuit, Check, ClipboardPlus, FileSignature, History,
  LoaderCircle, Plus, ShieldCheck, Stethoscope, Trash2, TriangleAlert,
} from "lucide-react";
import { apiJson } from "@/types/clinic";

type Medication = {
  id?: string;
  medicineName: string;
  genericName: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  timing: string;
  durationDays: number | null;
  instructions: string;
};

type Consultation = {
  appointmentId: string;
  consultationId: string | null;
  consultationStatus: "IN_PROGRESS" | "COMPLETED" | "SIGNED" | "AMENDED" | null;
  clinicalNote: string | null;
  followUpPlan: string | null;
  scheduledAt: number;
  appointmentStatus: string;
  serviceName: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  phoneLast4: string;
  priorVisits: number;
  prescriptionId: string | null;
  prescriptionStatus: "DRAFT" | "FINAL" | "VOID" | null;
  prescriptionNumber: string | null;
  invoiceId: string | null;
  invoiceStatus: string | null;
  medications: Medication[];
};

const blankMedication = (): Medication => ({
  medicineName: "", genericName: "", strength: "", dose: "", route: "Oral",
  frequency: "Once daily", timing: "", durationDays: 5, instructions: "",
});

function medicationPayload(item: Medication) {
  return {
    medicineName: item.medicineName,
    genericName: item.genericName,
    strength: item.strength,
    dose: item.dose,
    route: item.route,
    frequency: item.frequency,
    timing: item.timing,
    durationDays: item.durationDays,
    instructions: item.instructions,
  };
}

export function ConsultationsView() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["consultations"],
    queryFn: () => apiJson<{ consultations: Consultation[]; safety: { statement: string } }>("/api/consultations"),
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => query.data?.consultations.find((item) => item.appointmentId === selectedId) ?? query.data?.consultations[0] ?? null,
    [query.data, selectedId],
  );

  if (query.isLoading) return <div className="panel consultation-loading"><LoaderCircle className="spin" />Loading consultation workspace…</div>;
  if (query.isError) return <div className="error-banner"><TriangleAlert />{query.error.message}</div>;

  return <div className="page-stack consultation-page">
    <section className="page-heading">
      <div><p>Connected encounter</p><h2>Consultations</h2><span>Review patient context, document the visit, and prepare a clinician-confirmed prescription.</span></div>
      <div className="clinical-safety-chip" role="note"><ShieldCheck /><span><b>Clinician review required</b><small>{query.data?.safety.statement ?? "Clinical records require an explicit clinician action before finalization."}</small></span></div>
    </section>

    {!query.data?.consultations.length ? <section className="panel empty-state"><Stethoscope /><h3>No consultation work yet</h3><p>Check in and start a patient from the queue. Their encounter will appear here.</p></section> :
      <section className="consultation-layout">
        <aside className="panel encounter-list" aria-label="Consultation worklist">
          <header><span>Today and recent</span><b>{query.data.consultations.length}</b></header>
          {query.data.consultations.map((item) => <button type="button" key={item.appointmentId} className={selected?.appointmentId === item.appointmentId ? "active" : ""} aria-pressed={selected?.appointmentId === item.appointmentId} onClick={() => setSelectedId(item.appointmentId)}>
            <i>{item.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i>
            <span><b>{item.patientName}</b><small>{item.serviceName} · {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(item.scheduledAt)}</small></span>
            <em>{item.consultationStatus?.replaceAll("_", " ").toLowerCase() ?? item.appointmentStatus.toLowerCase()}</em>
          </button>)}
        </aside>

        {selected && <ConsultationWorkspace key={selected.appointmentId} selected={selected} onSaved={async () => queryClient.invalidateQueries({ queryKey: ["consultations"] })} />}
      </section>}
  </div>;
}

function ConsultationWorkspace({ selected, onSaved }: { selected: Consultation; onSaved: () => Promise<unknown> }) {
  const [clinicalNote, setClinicalNote] = useState(selected.clinicalNote ?? "");
  const [followUpPlan, setFollowUpPlan] = useState(selected.followUpPlan ?? "");
  const [medications, setMedications] = useState<Medication[]>(selected.medications.length ? selected.medications : [blankMedication()]);
  const [validation, setValidation] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (action: "SAVE_DRAFT" | "SIGN" | "AMEND") => apiJson<{ consultationStatus: string; prescriptionStatus: string }>("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId: selected.appointmentId,
        clinicalNote,
        followUpPlan,
        medications: medications.filter((item) => item.medicineName.trim()).map(medicationPayload),
        action,
      }),
    }),
    onSuccess: onSaved,
  });

  const confirmFinal = () => {
    if (!clinicalNote.trim()) {
      setValidation("Add the visit note before reviewing and signing this record.");
      return;
    }
    setValidation(null);
    const action = selected.consultationStatus === "SIGNED" ? "AMEND" : "SIGN";
    const message = action === "SIGN"
      ? "Sign this clinical note and finalize its prescription? Review every field first."
      : "Create an amended clinical record? The prior signed state remains in the audit trail.";
    if (window.confirm(message)) save.mutate(action);
  };

  const saveDraft = () => {
    if (!clinicalNote.trim()) {
      setValidation("Add the visit note before saving a draft.");
      return;
    }
    setValidation(null);
    save.mutate("SAVE_DRAFT");
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number | null) => {
    setMedications((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  return <div className="encounter-workspace">
          <section className="panel patient-context-card">
            <div className="context-title"><span>{selected.patientName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><p>{selected.patientNumber} · •••• {selected.phoneLast4}</p><h3>{selected.patientName}</h3><small>{selected.serviceName} · {selected.priorVisits ? `${selected.priorVisits} prior recorded visit${selected.priorVisits === 1 ? "" : "s"}` : "First recorded visit"}</small></div></div>
            <div className="record-brief" role="note" aria-label="Record-based pre-consultation context requiring doctor review"><BrainCircuit /><span><b>Record-based pre-consultation brief</b><p>{selected.priorVisits ? `Returning patient for ${selected.serviceName}. Review the underlying timeline before relying on prior context.` : `No earlier completed consultation is recorded for this patient. Do not infer missing history.`}</p><small>Generated only from visible clinic records · doctor review required</small></span></div>
            <div className="encounter-state"><span><History />{selected.consultationStatus?.replaceAll("_", " ") ?? "Not documented"}</span><span><FileSignature />{selected.prescriptionStatus ?? "No prescription"}</span><span><BadgeCheck />{selected.invoiceStatus ?? "Billing pending"}</span></div>
          </section>

          <section className="panel clinical-note-card">
            <header><div><p className="eyebrow">CLINICAL DOCUMENTATION</p><h3>Visit note</h3></div><span>{selected.consultationStatus === "SIGNED" ? "Signed record" : "Draft record"}</span></header>
            <label><span>Structured note</span><textarea rows={10} value={clinicalNote} onChange={(event) => setClinicalNote(event.target.value)} placeholder={"Complaint:\nHistory:\nExamination:\nAssessment:\nPlan:"} /></label>
            <label><span>Follow-up and approved care plan</span><textarea rows={3} value={followUpPlan} onChange={(event) => setFollowUpPlan(event.target.value)} placeholder="Follow-up timing, approved instructions, and checkpoints" /></label>
          </section>

          <section className="panel prescription-workspace">
            <header><div><p className="eyebrow">PRESCRIPTION</p><h3>Clinician-confirmed medicines</h3></div><button type="button" className="secondary-button" onClick={() => setMedications((items) => [...items, blankMedication()])}><Plus />Add medicine</button></header>
            <div className="prescription-safety" role="note"><ShieldCheck /><p><b>Structure only.</b> The system does not recommend a drug or change treatment. The prescriber must confirm every row.</p></div>
            {medications.map((item, index) => <fieldset className="medicine-row" key={`${index}-${item.id ?? "new"}`}>
              <legend>Medicine {index + 1}</legend>
              <label className="medicine-name"><span>Medicine / brand</span><input value={item.medicineName} onChange={(event) => updateMedication(index, "medicineName", event.target.value)} placeholder="Enter prescribed medicine" /></label>
              <label><span>Generic</span><input value={item.genericName} onChange={(event) => updateMedication(index, "genericName", event.target.value)} placeholder="Optional" /></label>
              <label><span>Strength</span><input value={item.strength} onChange={(event) => updateMedication(index, "strength", event.target.value)} placeholder="10 mg" /></label>
              <label><span>Dose</span><input value={item.dose} onChange={(event) => updateMedication(index, "dose", event.target.value)} placeholder="1 tablet" /></label>
              <label><span>Route</span><select value={item.route} onChange={(event) => updateMedication(index, "route", event.target.value)}><option>Oral</option><option>Topical</option><option>Inhaled</option><option>Injection</option><option>Other</option></select></label>
              <label><span>Frequency</span><input value={item.frequency} onChange={(event) => updateMedication(index, "frequency", event.target.value)} placeholder="Once daily" /></label>
              <label><span>Timing</span><input value={item.timing} onChange={(event) => updateMedication(index, "timing", event.target.value)} placeholder="At night" /></label>
              <label><span>Duration (days)</span><input type="number" min={1} max={3650} value={item.durationDays ?? ""} onChange={(event) => updateMedication(index, "durationDays", event.target.value ? Number(event.target.value) : null)} /></label>
              <label className="medicine-instructions"><span>Instructions</span><input value={item.instructions} onChange={(event) => updateMedication(index, "instructions", event.target.value)} placeholder="Clinician-approved instructions" /></label>
              <button type="button" className="icon-only medicine-remove" aria-label={`Remove medicine ${index + 1}`} onClick={() => setMedications((items) => items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button>
            </fieldset>)}
          </section>

          {validation && <div className="error-banner"><TriangleAlert />{validation}</div>}
          {save.isError && <div className="error-banner"><TriangleAlert />{save.error.message}</div>}
          {save.isSuccess && <div className="success-banner"><Check />Clinical record saved with an audit event.</div>}
          <footer className="encounter-actions">
            {selected.consultationStatus !== "SIGNED" && <button type="button" className="secondary-button" disabled={save.isPending} onClick={saveDraft}><ClipboardPlus />Save draft</button>}
            <button type="button" className="primary-button" disabled={save.isPending} onClick={confirmFinal}>{save.isPending ? <LoaderCircle className="spin" /> : <FileSignature />}{selected.consultationStatus === "SIGNED" ? "Amend signed record" : "Review and sign"}</button>
          </footer>
        </div>;
}
