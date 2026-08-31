"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  Check,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  HardDrive,
  MapPin,
  Phone,
  Rocket,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { apiJson } from "@/types/clinic";

type Config = {
  clinic: {
    name: string;
    doctor: string;
    timezone: string;
    address: string | null;
    phone: string | null;
    opensMinute: number;
    closesMinute: number;
    workingDays: string;
    status: string;
  };
  storage: {
    database: string;
    files: string;
    publicBucketUrls: boolean;
  };
};

export function SettingsView() {
  const [copied, setCopied] = useState(false);
  const query = useQuery({
    queryKey: ["clinic-config"],
    queryFn: () => apiJson<Config>("/api/config"),
  });
  const copy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/book`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const clinic = query.data?.clinic;

  return <div className="page-stack">
    <section className="page-heading"><div><p>Clinic configuration</p><h2>Settings</h2><span>Twacha’s operational identity and evidence-based readiness.</span></div></section>
    {query.isError && <div className="error-banner"><TriangleAlert />{query.error.message}</div>}
    <div className="settings-grid">
      <section className="panel settings-card">
        <header><span><Building2 /></span><div><p className="eyebrow">CLINIC PROFILE</p><h3>{clinic?.name ?? "Loading…"}</h3></div></header>
        <dl>
          <div><dt><MapPin />Location</dt><dd className={!clinic?.address?.startsWith("Address to") ? "" : "missing"}>{clinic?.address ?? "Not configured"}</dd></div>
          <div><dt><Phone />Phone</dt><dd className={clinic?.phone ? "" : "missing"}>{clinic?.phone ?? "Required before go-live"}</dd></div>
          <div><dt><Clock3 />Hours</dt><dd>Monday–Saturday · 11:00 AM–6:00 PM</dd></div>
          <div><dt><ShieldCheck />Timezone</dt><dd>{clinic?.timezone}</dd></div>
        </dl>
      </section>

      <section className="panel settings-card">
        <header><span><ExternalLink /></span><div><p className="eyebrow">PATIENT BOOKING</p><h3>Shareable clinic page</h3></div></header>
        <p>Patients can choose a service and reserve only conflict-free slots.</p>
        <div className="copy-field"><span>/book</span><button type="button" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy link"}</button></div>
        <a href="/book" target="_blank" rel="noreferrer">Open patient experience <ExternalLink /></a>
      </section>

      <section className="panel settings-card">
        <header><span><Database /></span><div><p className="eyebrow">DATA & STORAGE</p><h3>Platform capabilities</h3></div></header>
        <ul className="binding-list">
          <li><Database /><span><b>Clinic database</b><small>{query.data?.storage.database.toLowerCase().replaceAll("_", " ")}</small></span><Check /></li>
          <li><HardDrive /><span><b>Private documents</b><small>{query.data?.storage.files.toLowerCase().replaceAll("_", " ")}</small></span><TriangleAlert /></li>
          <li><ShieldCheck /><span><b>Public bucket URLs</b><small>Not used by this preview</small></span><Check /></li>
        </ul>
      </section>

      <section className="panel readiness-card">
        <p className="eyebrow">GO-LIVE READINESS</p>
        <h3>4 of 11 foundation items verified</h3>
        <div className="readiness-bar" aria-label="36% of launch foundations verified"><i style={{ width: "36%" }} /></div>
        <ul>
          <li className="done"><Check />Clinic identity</li>
          <li className="done"><Check />Doctor and service catalogue</li>
          <li className="done"><Check />Conflict-safe booking slice</li>
          <li className="done"><Check />Persistent clinic database</li>
          <li><TriangleAlert />Verified staff identity and RBAC</li>
          <li><TriangleAlert />Address, phone and communication providers</li>
          <li><TriangleAlert />Patient OTP, private files and privacy approval</li>
        </ul>
        <div className="settings-activation-entry">
          <span aria-hidden="true"><Rocket /></span>
          <div><b>Continue launch setup</b><p>Open the evidence-based activation checklist to review gates, blockers, and the safest next step.</p></div>
          <Link className="primary-button" href="/activate" aria-label="Open Twacha activation and launch readiness checklist">Open activation <ArrowRight /></Link>
        </div>
      </section>
    </div>
  </div>;
}
