"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowRight, BadgeIndianRupee, BrainCircuit, Boxes, CalendarClock, CheckCircle2,
  CircleDashed, LoaderCircle, RefreshCw, ShieldCheck, Sparkles, TriangleAlert, Users,
} from "lucide-react";
import { apiJson } from "@/types/clinic";

type Item = { id: string; category: string; severity: "NOW" | "TODAY" | "WATCH"; title: string; why: string; actionLabel: string; href: string; count: number };
type CenterData = {
  facts: { date: string; waitingPatients: number; inConsultation: number; overdueFollowUps: number; dueFollowUps: number; unpaidInvoices: number; outstandingPaise: number; unbilledEncounters: number; lowStockProducts: number; nearExpiryProducts: number; cancellations: number; noShows: number };
  items: Item[];
  ai: { status: "CONNECTED" | "NOT_CONNECTED"; model: string | null; mode: string; clinicalAutonomy: false };
};
type Brief = { headline: string; summary: string; priorities: Array<{ title: string; reason: string; evidence: string }>; uncertainty: string };

const categoryIcon = { PATIENT_FLOW: Users, FOLLOW_UP: CalendarClock, BILLING: BadgeIndianRupee, INVENTORY: Boxes, SCHEDULE: CalendarClock } as const;

export function ActionCenterView() {
  const query = useQuery({ queryKey: ["action-center"], queryFn: () => apiJson<CenterData>("/api/action-center"), refetchInterval: 30_000 });
  const brief = useMutation({ mutationFn: () => apiJson<{ brief: Brief }>("/api/ai/brief", { method: "POST" }) });
  if (query.isLoading) return <div className="panel action-loading"><LoaderCircle className="spin" />Reading the clinic’s current operating state…</div>;
  if (query.isError || !query.data) return <div className="error-banner"><TriangleAlert />{query.error?.message ?? "Action center unavailable"}</div>;
  const { facts, items, ai } = query.data;

  return <div className="page-stack action-center-page">
    <section className="page-heading">
      <div><p>Operational intelligence</p><h2>Action center</h2><span>Facts become a short, prioritized worklist—without hiding the underlying record.</span></div>
      <button type="button" className="secondary-button" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching ? "spin" : ""} />Refresh state</button>
    </section>

    <section className="panel ai-brief-card" aria-label="Administrative AI operations brief">
      <header><span className={ai.status === "CONNECTED" ? "connected" : "off"}><BrainCircuit /></span><div><p className="eyebrow">AI OPERATIONS BRIEF</p><h3>{ai.status === "CONNECTED" ? "Grounded brief ready on request" : "AI gateway not connected"}</h3></div><em>{ai.status.replaceAll("_", " ")}</em></header>
      {brief.data ? <div className="generated-brief" aria-live="polite"><h4>{brief.data.brief.headline}</h4><p>{brief.data.brief.summary}</p><div>{brief.data.brief.priorities.map((priority) => <article key={`${priority.title}-${priority.evidence}`}><b>{priority.title}</b><p>{priority.reason}</p><small>Evidence · {priority.evidence}</small></article>)}</div><footer><ShieldCheck />Uncertainty · {brief.data.brief.uncertainty}</footer></div> : <div className="ai-brief-empty"><p>{ai.status === "CONNECTED" ? "Send only aggregate operational counts to the configured model. No patient names, phone numbers, notes, prescriptions, or documents are included." : "Connect an approved model and set AI_PROVIDER_API_KEY + AI_MODEL. Until then, the action list below remains deterministic and fully usable."}</p><button type="button" className="primary-button" disabled={ai.status !== "CONNECTED" || brief.isPending} onClick={() => brief.mutate()}>{brief.isPending ? <LoaderCircle className="spin" /> : ai.status === "CONNECTED" ? <Sparkles /> : <CircleDashed />}{ai.status === "CONNECTED" ? "Generate grounded brief" : "Not connected"}</button></div>}
      {brief.isError && <div className="inline-error"><TriangleAlert />{brief.error.message}</div>}
      <footer className="ai-boundary" role="note"><ShieldCheck /><span><b>Administrative operations only</b><small>No diagnosis, treatment, or prescribing authority. Generated text requires staff review.</small></span></footer>
    </section>

    <section className="action-facts" aria-label="Current clinic facts">
      <article><Users /><span><small>Waiting now</small><b>{facts.waitingPatients}</b></span></article>
      <article><CheckCircle2 /><span><small>In consultation</small><b>{facts.inConsultation}</b></span></article>
      <article><CalendarClock /><span><small>Follow-ups due</small><b>{facts.overdueFollowUps + facts.dueFollowUps}</b></span></article>
      <article><BadgeIndianRupee /><span><small>Outstanding</small><b>₹{(facts.outstandingPaise / 100).toLocaleString("en-IN")}</b></span></article>
      <article><Boxes /><span><small>Low stock</small><b>{facts.lowStockProducts}</b></span></article>
    </section>

    <section className="action-list">
      <header><div><p className="eyebrow">DETERMINISTIC WORKLIST</p><h3>Recommended attention</h3></div><span>{items.length} item{items.length === 1 ? "" : "s"}</span></header>
      {items.map((item) => {
        const Icon = categoryIcon[item.category as keyof typeof categoryIcon] ?? CheckCircle2;
        return <article className={`panel action-item severity-${item.severity.toLowerCase()}`} key={item.id}><span className="action-icon"><Icon /></span><div><span className="fact-label">FACT · {item.category.replaceAll("_", " ")}</span><h4>{item.title}</h4><p><b>Why:</b> {item.why}</p></div><Link href={item.href}>{item.actionLabel}<ArrowRight /></Link></article>;
      })}
      {!items.length && <div className="panel empty-state"><CheckCircle2 /><h3>No urgent operational actions</h3><p>The queue, follow-ups, billing, and inventory thresholds are clear right now.</p></div>}
    </section>
  </div>;
}
