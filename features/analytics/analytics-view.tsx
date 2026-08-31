"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarCheck, Clock3, RefreshCw, RotateCcw, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { apiJson, type DashboardData } from "@/types/clinic";

export function AnalyticsView() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: () => apiJson<DashboardData>("/api/dashboard") });
  if (query.isLoading) return <div className="skeleton panel-skeleton" />;
  if (query.isError || !query.data) return <section className="error-state"><TriangleAlert /><h2>Clinic pulse could not load</h2><p>{query.error?.message}</p><button type="button" onClick={() => query.refetch()}><RefreshCw />Try again</button></section>;
  const { metrics, appointments } = query.data;
  const rate = (value: number) => metrics.appointments ? Math.round(value / metrics.appointments * 100) : 0;
  const sources = appointments.reduce<Record<string, number>>((acc, item) => { acc[item.source] = (acc[item.source] ?? 0) + 1; return acc; }, {});
  const maxSource = Math.max(1, ...Object.values(sources));
  return <div className="page-stack"><section className="page-heading"><div><p>Clinic Pulse</p><h2>Operational analytics</h2><span>Validated current-period signals, without revenue promises or vanity metrics.</span></div><div className="period-pill">Today · Asia/Kolkata</div></section><section className="analytics-kpis"><article><CalendarCheck /><div><small>Completion rate</small><b>{rate(metrics.completed)}%</b><span>{metrics.completed} of {metrics.appointments} visits</span></div></article><article><Clock3 /><div><small>Average queue wait</small><b>{metrics.averageWait} min</b><span>Current waiting patients</span></div></article><article><Activity /><div><small>No-show rate</small><b>{rate(metrics.noShows)}%</b><span>{metrics.noShows} today</span></div></article><article><RotateCcw /><div><small>Follow-ups due</small><b>{metrics.followUpsDue}</b><span>Actionable worklist</span></div></article></section><div className="analytics-grid"><section className="panel source-chart"><header><div><p className="eyebrow">BOOKING SOURCE</p><h3>Where today’s visits came from</h3></div><Users /></header><div>{Object.entries(sources).map(([source,count]) => <article key={source}><span>{source.toLowerCase().replaceAll("_"," ")}</span><div><i style={{ width: `${count/maxSource*100}%` }} /></div><b>{count}</b></article>)}</div></section><section className="panel pulse-card"><header><div><p className="eyebrow">WEEKLY COMPARISON</p><h3>Baseline in progress</h3></div><TrendingUp /></header><p>Trend arrows will appear after a complete prior period exists. This prevents a single seeded day from being presented as a real improvement.</p><ul><li><span>Appointments</span><b>{metrics.appointments}</b></li><li><span>New patients</span><b>{metrics.newPatients}</b></li><li><span>Cancelled</span><b>{metrics.cancelled}</b></li><li><span>No-shows</span><b>{metrics.noShows}</b></li></ul></section></div></div>;
}
