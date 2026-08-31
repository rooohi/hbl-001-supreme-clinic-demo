"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, History, Search, ShieldCheck, TriangleAlert, UserPlus, Users } from "lucide-react";
import { apiJson } from "@/types/clinic";

type Patient = { id: string; patientNumber: string; displayName: string; phoneLast4: string; email: string | null; status: string; visitCount: number; lastVisitAt: number | null };

function visitDate(timestamp: number | null) {
  return timestamp
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(timestamp)
    : "New patient";
}

export function PatientsView() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const result = useQuery({ queryKey: ["patients", query], queryFn: () => apiJson<{ patients: Patient[] }>(`/api/patients?q=${encodeURIComponent(query)}`) });
  return <div className="page-stack">
    <section className="page-heading"><div><p>Patient records</p><h2>Patients</h2><span>Tenant-scoped search with a concise visit history.</span></div><button className="primary-button" type="button" disabled title="Standalone patient creation is not enabled in this preview"><UserPlus />Add patient</button></section>
    <section className="patient-directory-layout">
      <div className="panel patient-directory">
        <header><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or patient ID" aria-label="Search patients" /></label><span aria-live="polite">{result.data?.patients.length ?? 0} results</span></header>
        {result.isError && <div className="inline-error"><TriangleAlert />{result.error.message}</div>}
        <div className="patient-table"><div className="patient-table-head"><span>Patient</span><span>Contact</span><span>Visits</span><span>Last visit</span><span /></div>{result.data?.patients.map((patient) => <button type="button" key={patient.id} onClick={() => setSelected(patient)} className={selected?.id === patient.id ? "selected" : ""} aria-pressed={selected?.id === patient.id}><span className="patient-cell"><i>{patient.displayName.split(" ").map((part) => part[0]).join("").slice(0,2)}</i><span><b>{patient.displayName}</b><small>{patient.patientNumber}</small><small className="patient-mobile-meta">•••• {patient.phoneLast4} · {patient.visitCount} {patient.visitCount === 1 ? "visit" : "visits"} · {visitDate(patient.lastVisitAt)}</small></span></span><span>•••• {patient.phoneLast4}<small>{patient.email ?? "No email"}</small></span><span>{patient.visitCount}</span><span>{visitDate(patient.lastVisitAt)}</span><ArrowRight /></button>)}</div>
        {result.data?.patients.length === 0 && <div className="empty-state"><Users /><h3>No patients found</h3><p>Try another name, phone number or patient ID.</p></div>}
      </div>
      <aside className="panel patient-preview">
        {selected ? <><div className="profile-head"><span>{selected.displayName.split(" ").map((part) => part[0]).join("").slice(0,2)}</span><div><h3>{selected.displayName}</h3><p>{selected.patientNumber} · •••• {selected.phoneLast4}</p></div></div><div className="profile-stat-grid"><span><b>{selected.visitCount}</b><small>Completed visits</small></span><span><b>{selected.status}</b><small>Patient status</small></span></div><div className="profile-actions"><button type="button" disabled title="Timeline workspace is not enabled in this preview"><History />Open timeline</button><button type="button" disabled title="Private file workflows are not enabled in this preview"><FileText />Documents</button></div><div className="privacy-note"><ShieldCheck /><p><b>Private clinic record</b><span>Clinical notes and private file workflows are intentionally withheld until audited authorization is connected.</span></p></div></> : <div className="empty-state compact"><Users /><h3>Select a patient</h3><p>Review contact details and visit activity without leaving the list.</p></div>}
      </aside>
    </section>
  </div>;
}
