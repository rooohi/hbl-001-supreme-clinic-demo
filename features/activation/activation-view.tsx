"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, CircleDashed, LoaderCircle, LockKeyhole, Rocket, ShieldCheck, TriangleAlert } from "lucide-react";
import { apiJson } from "@/types/clinic";

type Activation = {
  steps: Array<{ key: string; label: string; detail: string; status: "COMPLETE" | "BLOCKED" | "READY_TO_VERIFY" | "OPTIONAL"; href: string }>;
  progress: { complete: number; total: number; percent: number; blockers: number };
  activation: { status: string; publicLaunchAllowed: false };
  note: string;
};

export function ActivationView() {
  const query = useQuery({ queryKey: ["activation"], queryFn: () => apiJson<Activation>("/api/activation") });
  if (query.isLoading) return <div className="panel activation-loading"><LoaderCircle className="spin" />Checking launch gates…</div>;
  if (query.isError || !query.data) return <div className="error-banner"><TriangleAlert />{query.error?.message ?? "Activation unavailable"}</div>;
  const data = query.data;
  return <div className="page-stack activation-page">
    <section className="activation-hero panel">
      <div><span><Rocket /></span><p className="eyebrow">TWACHA ACTIVATION</p><h2>{data.progress.blockers ? "Prepare the clinic safely." : "Ready for final approval."}</h2><p>Activation is evidence-based. A credential, migration, or checklist label never substitutes for a tested workflow.</p></div>
      <aside><b>{data.progress.percent}%</b><span>{data.progress.complete} of {data.progress.total} required gates complete</span><div><i style={{ width: `${data.progress.percent}%` }} /></div></aside>
    </section>
    <section className="activation-grid">
      {data.steps.map((step, index) => <article className={`panel activation-step status-${step.status.toLowerCase()}`} key={step.key}>
        <span className="activation-index">{step.status === "COMPLETE" ? <Check /> : step.status === "BLOCKED" ? <LockKeyhole /> : <CircleDashed />}</span>
        <div><small>STEP {String(index + 1).padStart(2, "0")} · {step.status.replaceAll("_", " ")}</small><h3>{step.label}</h3><p>{step.detail}</p></div>
        <Link href={step.href}>Open setup <ArrowRight /></Link>
      </article>)}
    </section>
    <section className="panel activation-gate"><ShieldCheck /><div><b>{data.progress.blockers} launch blocker{data.progress.blockers === 1 ? "" : "s"} remain</b><p>{data.note}</p></div><span>{data.activation.status.replaceAll("_", " ")}</span></section>
  </div>;
}
