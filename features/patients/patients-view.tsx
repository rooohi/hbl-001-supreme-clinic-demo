"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Download, FileText, History, LoaderCircle, Search, ShieldCheck, Trash2, TriangleAlert, Upload, UserPlus, Users, X } from "lucide-react";
import { apiJson } from "@/types/clinic";

type Patient = { id: string; patientNumber: string; displayName: string; phoneLast4: string; email: string | null; status: string; visitCount: number; lastVisitAt: number | null };
type Timeline = {
  appointments: Array<{ id: string; occurredAt: number; title: string; status: string; type: string; reason: string | null }>;
  consultations: Array<{ id: string; occurredAt: number; status: string; clinicalNote: string | null; followUpPlan: string | null }>;
  invoices: Array<{ id: string; invoiceNumber: string; status: string; totalPaise: number; paidPaise: number; occurredAt: number | null }>;
  followUps: Array<{ id: string; dueDate: string; status: string; note: string | null }>;
};
type DocumentItem = { key: string; name: string; size: number; uploadedAt: number; contentType: string };

function visitDate(timestamp: number | null) {
  return timestamp ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(timestamp) : "New patient";
}

export function PatientsView() {
  const client = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedOverride, setSelectedOverride] = useState<Patient | null>(null);
  const [tab, setTab] = useState<"SUMMARY" | "TIMELINE" | "DOCUMENTS">("SUMMARY");
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const result = useQuery({ queryKey: ["patients", query], queryFn: () => apiJson<{ patients: Patient[] }>(`/api/patients?q=${encodeURIComponent(query)}`) });
  const selected = result.data?.patients.find((item) => item.id === searchParams.get("selected")) ?? selectedOverride;
  const details = useQuery({ queryKey: ["patient-details", selected?.id], queryFn: () => apiJson<{ timeline: Timeline }>(`/api/patients/${selected!.id}`), enabled: Boolean(selected) });
  const documents = useQuery({ queryKey: ["patient-documents", selected?.id], queryFn: () => apiJson<{ documents: DocumentItem[] }>(`/api/patients/${selected!.id}/documents`), enabled: Boolean(selected) && tab === "DOCUMENTS" });

  const create = useMutation({
    mutationFn: (input: Record<string, string>) => apiJson<{ patient: Patient }>("/api/patients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
    onSuccess: async ({ patient }) => {
      setNotice(`${patient.displayName} was added as ${patient.patientNumber}.`);
      setAdding(false);
      setSelectedOverride(patient);
      setTab("SUMMARY");
      router.replace(`/patients?selected=${patient.id}`);
      await client.invalidateQueries({ queryKey: ["patients"] });
    },
  });
  const upload = useMutation({
    mutationFn: (form: FormData) => apiJson<{ document: DocumentItem }>(`/api/patients/${selected!.id}/documents`, { method: "POST", body: form }),
    onSuccess: async ({ document }) => { setNotice(`${document.name} uploaded to the private patient record.`); await client.invalidateQueries({ queryKey: ["patient-documents", selected?.id] }); },
  });
  const removeDocument = useMutation({
    mutationFn: (key: string) => apiJson(`/api/patients/${selected!.id}/documents?key=${encodeURIComponent(key)}`, { method: "DELETE" }),
    onSuccess: async () => { setNotice("Document deleted from private storage."); await client.invalidateQueries({ queryKey: ["patient-documents", selected?.id] }); },
  });

  const choosePatient = (patient: Patient) => {
    setSelectedOverride(patient);
    setTab("SUMMARY");
    router.replace(`/patients?selected=${patient.id}`);
  };
  const submitPatient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)])));
  };
  const submitDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    upload.mutate(new FormData(event.currentTarget));
  };

  return <div className="page-stack">
    <section className="page-heading"><div><p>Patient records</p><h2>Patients</h2><span>Create, search, review timelines, and manage consent-confirmed private documents.</span></div><button className="primary-button" type="button" onClick={() => { create.reset(); setAdding(true); }}><UserPlus />Add patient</button></section>
    {notice && <div className="success-banner"><Check /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice(null)}><X /></button></div>}
    <section className="patient-directory-layout">
      <div className="panel patient-directory">
        <header><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or patient ID" aria-label="Search patients" /></label><span aria-live="polite">{result.data?.patients.length ?? 0} results</span></header>
        {result.isError && <div className="inline-error"><TriangleAlert />{result.error.message}</div>}
        <div className="patient-table"><div className="patient-table-head"><span>Patient</span><span>Contact</span><span>Visits</span><span>Last visit</span><span /></div>{result.data?.patients.map((patient) => <button type="button" key={patient.id} onClick={() => choosePatient(patient)} className={selected?.id === patient.id ? "selected" : ""} aria-pressed={selected?.id === patient.id}><span className="patient-cell"><i>{patient.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><span><b>{patient.displayName}</b><small>{patient.patientNumber}</small><small className="patient-mobile-meta">•••• {patient.phoneLast4} · {patient.visitCount} {patient.visitCount === 1 ? "visit" : "visits"} · {visitDate(patient.lastVisitAt)}</small></span></span><span>•••• {patient.phoneLast4}<small>{patient.email ?? "No email"}</small></span><span>{patient.visitCount}</span><span>{visitDate(patient.lastVisitAt)}</span><ArrowRight /></button>)}</div>
        {result.data?.patients.length === 0 && <div className="empty-state"><Users /><h3>No patients found</h3><p>Try another name, phone number or patient ID, or add a new patient.</p><button type="button" onClick={() => setAdding(true)}><UserPlus />Add first patient</button></div>}
      </div>
      <aside className="panel patient-preview">
        {selected ? <><div className="profile-head"><span>{selected.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><h3>{selected.displayName}</h3><p>{selected.patientNumber} · •••• {selected.phoneLast4}</p></div></div><div className="profile-stat-grid"><span><b>{selected.visitCount}</b><small>Completed visits</small></span><span><b>{selected.status}</b><small>Patient status</small></span></div><div className="profile-actions"><button type="button" className={tab === "SUMMARY" ? "active" : ""} onClick={() => setTab("SUMMARY")}><Users />Summary</button><button type="button" className={tab === "TIMELINE" ? "active" : ""} onClick={() => setTab("TIMELINE")}><History />Timeline</button><button type="button" className={tab === "DOCUMENTS" ? "active" : ""} onClick={() => setTab("DOCUMENTS")}><FileText />Documents</button></div>
          {tab === "SUMMARY" && <div className="privacy-note"><ShieldCheck /><p><b>Private clinic record</b><span>Open the timeline for recorded visits or Documents for consent-confirmed private files.</span></p></div>}
          {tab === "TIMELINE" && <PatientTimeline timeline={details.data?.timeline} loading={details.isLoading} error={details.error?.message} />}
          {tab === "DOCUMENTS" && <section className="patient-documents"><form onSubmit={submitDocument}><label><span>Choose document</span><input name="file" type="file" accept="application/pdf,image/jpeg,image/png" required /></label><label className="consent-check"><input type="checkbox" name="consentConfirmed" value="true" required /><span>Patient consent for private document storage is confirmed.</span></label>{upload.isError && <div className="inline-error"><TriangleAlert />{upload.error.message}</div>}<button type="submit" className="primary-button" disabled={upload.isPending}>{upload.isPending ? <LoaderCircle className="spin" /> : <Upload />}Upload document</button></form>{documents.isLoading ? <p>Loading private documents…</p> : documents.isError ? <div className="inline-error"><TriangleAlert />{documents.error.message}</div> : documents.data?.documents.length ? <div className="document-list">{documents.data.documents.map((document) => <article key={document.key}><FileText /><span><b>{document.name}</b><small>{Math.max(1, Math.round(document.size / 1024))} KB · {visitDate(document.uploadedAt)}</small></span><a href={`/api/patients/${selected.id}/documents?key=${encodeURIComponent(document.key)}`} aria-label={`Download ${document.name}`}><Download /></a><button type="button" aria-label={`Delete ${document.name}`} onClick={() => { if (window.confirm(`Delete ${document.name}?`)) removeDocument.mutate(document.key); }} disabled={removeDocument.isPending}><Trash2 /></button></article>)}</div> : <div className="empty-state compact"><FileText /><h3>No documents yet</h3><p>Upload a consent-confirmed PDF, JPEG, or PNG up to 5 MB.</p></div>}</section>}
        </> : <div className="empty-state compact"><Users /><h3>Select a patient</h3><p>Review contact details and visit activity without leaving the list.</p></div>}
      </aside>
    </section>

    {adding && <div className="modal-backdrop appointment-modal"><section className="management-dialog" role="dialog" aria-modal="true" aria-label="Add patient"><header><div><p className="eyebrow">PATIENT DIRECTORY</p><h3>Add patient</h3></div><button type="button" aria-label="Close patient form" onClick={() => setAdding(false)}><X /></button></header><form className="management-form" onSubmit={submitPatient}>
      <label><span>Full name</span><input name="displayName" required minLength={2} maxLength={120} autoComplete="name" /></label>
      <label><span>Mobile number</span><input name="phone" required type="tel" minLength={10} maxLength={18} autoComplete="tel" placeholder="98765 43210" /></label>
      <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
      <label><span>Date of birth</span><input name="dateOfBirth" type="date" /></label>
      <label><span>Gender</span><select name="gender" defaultValue="UNDISCLOSED"><option value="UNDISCLOSED">Prefer not to say</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="NON_BINARY">Non-binary</option><option value="OTHER">Other</option></select></label>
      <div className="configuration-notice full"><ShieldCheck /><div><b>Minimum necessary record</b><p>Confirm the mobile number and collect only information needed for care operations.</p></div></div>
      {create.isError && <div className="inline-error full"><TriangleAlert />{create.error.message}</div>}
      <footer className="full"><button type="button" className="secondary-button" onClick={() => setAdding(false)}>Cancel</button><button type="submit" className="primary-button" disabled={create.isPending}>{create.isPending ? <LoaderCircle className="spin" /> : <UserPlus />}Create patient</button></footer>
    </form></section></div>}
  </div>;
}

function PatientTimeline({ timeline, loading, error }: { timeline?: Timeline; loading: boolean; error?: string }) {
  if (loading) return <p>Loading patient timeline…</p>;
  if (error) return <div className="inline-error"><TriangleAlert />{error}</div>;
  const events = [
    ...(timeline?.appointments.map((item) => ({ id: `a-${item.id}`, at: item.occurredAt, kind: "Appointment", title: item.title, detail: `${item.status.toLowerCase().replaceAll("_", " ")} · ${item.reason ?? item.type.toLowerCase().replaceAll("_", " ")}` })) ?? []),
    ...(timeline?.consultations.map((item) => ({ id: `c-${item.id}`, at: item.occurredAt, kind: "Consultation", title: item.status.toLowerCase().replaceAll("_", " "), detail: item.followUpPlan ?? item.clinicalNote ?? "Clinical record saved" })) ?? []),
    ...(timeline?.invoices.map((item) => ({ id: `i-${item.id}`, at: item.occurredAt ?? 0, kind: "Invoice", title: item.invoiceNumber, detail: `${item.status.toLowerCase().replaceAll("_", " ")} · ₹${(item.totalPaise / 100).toLocaleString("en-IN")}` })) ?? []),
  ].sort((a, b) => b.at - a.at);
  return <section className="patient-timeline">{events.length ? events.map((event) => <article key={event.id}><span><b>{event.kind}</b><small>{visitDate(event.at)}</small></span><div><b>{event.title}</b><p>{event.detail}</p></div></article>) : <div className="empty-state compact"><History /><h3>No timeline events</h3><p>Appointments, consultations, and invoices will appear here.</p></div>}</section>;
}
