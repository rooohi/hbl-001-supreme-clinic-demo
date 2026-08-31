"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Activity, CheckCircle2, Clock3, Forward, LoaderCircle, Megaphone, Play, RefreshCw, RotateCcw, SkipForward, TriangleAlert, UserRoundCheck, Users, XCircle } from "lucide-react";
import { apiJson, type QueueEntry } from "@/types/clinic";

type Action = "CALL" | "START" | "COMPLETE" | "SKIP" | "NO_SHOW" | "RETURN_TO_WAITING";

function statusLabel(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/^./, (value) => value.toUpperCase()); }
function waitLabel(seconds: number | null) { if (seconds == null) return "Calculating"; if (seconds < 60) return "Now"; return `~${Math.round(seconds / 60)} min`; }

export function QueueView() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["queue"],
    queryFn: () => apiJson<{ queue: QueueEntry[]; date: string; estimateLabel: string }>("/api/queue"),
    refetchInterval: 8_000,
  });
  const action = useMutation({
    mutationFn: ({ entry, action, followUpInterval }: { entry: QueueEntry; action: Action; followUpInterval?: string }) => apiJson<{ queue: QueueEntry[]; status: string }>("/api/queue", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ entryId: entry.id, action, rowVersion: entry.rowVersion, followUpInterval }),
    }),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["queue"] }); client.invalidateQueries({ queryKey: ["dashboard"] }); client.invalidateQueries({ queryKey: ["appointments"] }); },
  });

  if (query.isLoading) return <div className="page-stack"><div className="skeleton hero-skeleton" /><div className="skeleton panel-skeleton" /></div>;
  if (query.isError || !query.data) return <section className="error-state"><TriangleAlert /><h2>Live queue could not load</h2><p>{query.error?.message}</p><button type="button" onClick={() => query.refetch()}><RefreshCw />Try again</button></section>;
  const queue = query.data.queue;
  const consulting = queue.find((entry) => entry.status === "IN_CONSULTATION");
  const waiting = queue.filter((entry) => entry.status === "WAITING" || entry.status === "CALLED");
  const complete = queue.filter((entry) => entry.status === "COMPLETED").length;
  const next = waiting[0];

  return <div className="page-stack queue-page">
    <section className="page-heading"><div><p>Reception mode</p><h2>Live queue</h2><span>Call, start and complete patients without losing the clinic’s place.</span></div><div className="live-sync"><i />Live operational view <button type="button" onClick={() => query.refetch()} aria-label="Refresh queue"><RefreshCw /></button></div></section>
    {action.isError && <div className="error-banner"><TriangleAlert /><span>{action.error.message}</span><button type="button" onClick={() => action.reset()}><XCircle /></button></div>}
    <section className="queue-summary-cards">
      <article><span className="summary-icon teal"><Activity /></span><div><small>Current token</small><b>{consulting ? `T-${consulting.tokenNumber}` : "—"}</b><p>{consulting ? consulting.patientName : "Room ready"}</p></div></article>
      <article><span className="summary-icon blue"><Users /></span><div><small>Patients waiting</small><b>{waiting.length}</b><p>{next ? `T-${next.tokenNumber} is up next` : "No one waiting"}</p></div></article>
      <article><span className="summary-icon amber"><Clock3 /></span><div><small>Estimated wait</small><b>{next ? waitLabel(next.estimatedWaitSeconds) : "—"}</b><p>For the next patient</p></div></article>
      <article><span className="summary-icon green"><CheckCircle2 /></span><div><small>Completed</small><b>{complete}</b><p>Today’s consultations</p></div></article>
    </section>

    <div className="queue-layout">
      <section className="panel queue-list-panel">
        <header><div><p className="eyebrow">WAITING ROOM</p><h3>Queue order</h3></div><span>{query.data.estimateLabel}</span></header>
        <div className="queue-table">
          {queue.map((entry) => <article key={entry.id} className={`queue-row ${entry.status.toLowerCase()}`}>
            <span className="queue-token">T-{entry.tokenNumber}</span>
            <div className="queue-person"><span className="avatar">{entry.patientName.split(" ").map((part) => part[0]).join("").slice(0,2)}</span><div><b>{entry.patientName}</b><small>{entry.patientNumber ?? "Clinic patient"}</small></div></div>
            <div className="queue-service"><b>{entry.serviceName}</b><small>{entry.status === "IN_CONSULTATION" ? "With doctor" : `${waitLabel(entry.estimatedWaitSeconds)} estimated`}</small></div>
            <span className={`status status-${entry.status.toLowerCase()}`}>{statusLabel(entry.status)}</span>
            <QueueActions entry={entry} pending={action.isPending} perform={(nextAction, followUpInterval) => action.mutate({ entry, action: nextAction, followUpInterval })} />
          </article>)}
          {queue.length === 0 && <div className="empty-state"><Users /><h3>No patients in the queue</h3><p>Check in an appointment or add a walk-in from the appointments page.</p></div>}
        </div>
      </section>
      <aside className="queue-control-rail">
        <section className="panel call-next-card">
          <p className="eyebrow">ONE-CLICK ACTION</p><h3>{next ? `Call T-${next.tokenNumber}` : "Queue is clear"}</h3><p>{next ? `${next.patientName} · ${next.serviceName}` : "The next checked-in patient will appear here."}</p>
          {next ? <button type="button" disabled={action.isPending} onClick={() => action.mutate({ entry: next, action: next.status === "CALLED" ? "START" : "CALL" })}>{action.isPending ? <LoaderCircle className="spin" /> : next.status === "CALLED" ? <Play /> : <Megaphone />}{next.status === "CALLED" ? "Start consultation" : "Call next patient"}</button> : <Link className="queue-empty-action" href="/appointments?new=1"><Users />Add or check in patient</Link>}
        </section>
        <section className="panel queue-policy-card"><h3>Queue estimate</h3><div><Clock3 /><span><b>Deterministic, not AI</b><small>Uses service duration, current consultation and queue order.</small></span></div><div><UserRoundCheck /><span><b>Patient-safe view</b><small>Public tracking exposes tokens and timing, never names.</small></span></div></section>
      </aside>
    </div>
  </div>;
}

function QueueActions({ entry, pending, perform }: { entry: QueueEntry; pending: boolean; perform: (action: Action, followUpInterval?: string) => void }) {
  const [followUpInterval, setFollowUpInterval] = useState("NONE");
  if (entry.status === "WAITING") return <div className="queue-actions"><button type="button" disabled={pending} onClick={() => perform("CALL")}><Megaphone />Call</button><button type="button" className="icon-only" disabled={pending} onClick={() => perform("SKIP")} title="Skip"><SkipForward /></button></div>;
  if (entry.status === "CALLED") return <div className="queue-actions"><button type="button" disabled={pending} onClick={() => perform("START")}><Play />Start</button><button type="button" className="icon-only" disabled={pending} onClick={() => perform("RETURN_TO_WAITING")} title="Return to waiting"><RotateCcw /></button></div>;
  if (entry.status === "IN_CONSULTATION") return <div className="queue-actions complete-actions"><label><span className="sr-only">Follow-up interval</span><select value={followUpInterval} onChange={(event) => setFollowUpInterval(event.target.value)}><option value="NONE">No follow-up</option><option value="3D">3 days</option><option value="7D">7 days</option><option value="15D">15 days</option><option value="1M">1 month</option><option value="3M">3 months</option></select></label><button type="button" disabled={pending} onClick={() => perform("COMPLETE", followUpInterval === "NONE" ? undefined : followUpInterval)}><CheckCircle2 />Complete</button></div>;
  if (entry.status === "SKIPPED") return <div className="queue-actions"><button type="button" disabled={pending} onClick={() => perform("RETURN_TO_WAITING")}><RotateCcw />Return</button><button type="button" className="icon-only" disabled={pending} onClick={() => perform("NO_SHOW")} title="Mark no-show"><Forward /></button></div>;
  return <span className="queue-done"><CheckCircle2 />Recorded</span>;
}
