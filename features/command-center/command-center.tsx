"use client";

import Link from "@/components/native-link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity, ArrowRight, CalendarDays, CheckCircle2, Clock3, RefreshCw,
  Sparkles, Stethoscope, TriangleAlert, Users,
} from "lucide-react";
import { apiJson, type Appointment, type DashboardData } from "@/types/clinic";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(timestamp);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
}

function statusLabel(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function peakWindow(appointments: Appointment[]) {
  const hours = new Map<number, number>();
  appointments.filter((item) => !["CANCELLED", "NO_SHOW"].includes(item.status)).forEach((item) => {
    const hour = Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(item.scheduledAt));
    hours.set(hour, (hours.get(hour) ?? 0) + 1);
  });
  const peak = [...hours.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  if (!peak) return "No peak period yet";
  const start = new Date(Date.UTC(2026, 0, 1, peak[0] - 5, -30));
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric" });
  return `${formatter.format(start)}–${formatter.format(end)}`;
}

export function CommandCenter() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiJson<DashboardData>("/api/dashboard"),
    refetchInterval: 20_000,
  });

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) return <DashboardError message={query.error?.message} retry={() => query.refetch()} />;
  const data = query.data;
  const active = data.queue.find((entry) => entry.status === "IN_CONSULTATION");
  const upNext = data.queue.find((entry) => entry.status === "CALLED" || entry.status === "WAITING");
  const completion = data.metrics.appointments ? Math.round(data.metrics.completed / data.metrics.appointments * 100) : 0;
  const isOpen = (() => {
    const parts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", hour12: false }).formatToParts(new Date());
    const weekday = parts.find((part) => part.type === "weekday")?.value;
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    return weekday !== "Sun" && hour >= 11 && hour < 18;
  })();

  return <div className="page-stack">
    <section className="welcome-row">
      <div><p>{formatDate(data.date)}</p><h2>Good afternoon, Dr. Suman</h2><span>Here is the clinic’s live operating picture.</span></div>
      <div className={`clinic-open-pill ${isOpen ? "open" : "closed"}`}><i />{isOpen ? "Clinic is open" : "Clinic is closed"}<span>Mon–Sat · 11 AM–6 PM</span></div>
    </section>

    <section className="metrics metrics-v2" aria-label="Today’s clinic metrics">
      <article><div className="metric-icon blue"><CalendarDays /></div><div><span>Appointments</span><strong>{data.metrics.appointments}</strong><small>{data.metrics.newPatients} new patients</small></div></article>
      <article><div className="metric-icon green"><CheckCircle2 /></div><div><span>Completed</span><strong>{data.metrics.completed}</strong><small className="positive">{completion}% of today</small></div></article>
      <article><div className="metric-icon teal"><Users /></div><div><span>Waiting now</span><strong>{data.metrics.waiting}</strong><small>{data.metrics.averageWait} min estimated average</small></div></article>
      <article><div className="metric-icon amber"><Clock3 /></div><div><span>Follow-ups due</span><strong>{data.metrics.followUpsDue}</strong><small className="attention">{data.followUps.filter((item) => item.status === "OVERDUE").length} overdue</small></div></article>
    </section>

    <div className="dashboard-grid dashboard-grid-v2">
      <section className="panel schedule-panel schedule-panel-v2">
        <header><div><p className="eyebrow">TODAY’S FLOW</p><h2>Appointments</h2></div><Link href="/appointments">Open calendar <ArrowRight /></Link></header>
        <div className="appointment-list appointment-list-v2">
          {data.appointments.slice(0, 6).map((appointment, index) => <article key={appointment.id} className={appointment.status === "IN_CONSULTATION" ? "current" : ""}>
            <time>{formatTime(appointment.scheduledAt)}<small>{index === 0 ? "TODAY" : appointment.durationMinutes + " MIN"}</small></time>
            <span className={`avatar avatar-${index % 4}`}>{initials(appointment.patientName)}</span>
            <div className="appointment-copy"><b>{appointment.patientName}</b><span>{statusLabel(appointment.type)} · {appointment.serviceName}</span></div>
            <span className={`status status-${appointment.status.toLowerCase()}`}>{statusLabel(appointment.status)}</span>
            <Link href={`/appointments?selected=${appointment.id}`} aria-label={`Open ${appointment.patientName}'s appointment`}><ArrowRight /></Link>
          </article>)}
          {data.appointments.length === 0 && <div className="empty-state compact"><CalendarDays /><h3>No appointments today</h3><p>The schedule is clear. Add a booking or keep the day unblocked.</p><Link href="/appointments?new=1">Create appointment</Link></div>}
        </div>
        <footer><Activity /><span>Live source</span><b>Persistent clinic data · refreshes every 20 seconds</b><button type="button" onClick={() => query.refetch()}><RefreshCw />Refresh</button></footer>
      </section>

      <aside className="right-rail">
        <section className="panel now-panel now-panel-v2">
          <header><div><p className="eyebrow">LIVE QUEUE</p><h2>{active ? "Now consulting" : "Queue ready"}</h2></div>{active && <span className="token">T-{active.tokenNumber}</span>}</header>
          {active ? <>
            <div className="patient-focus"><span className="focus-avatar">{initials(active.patientName)}</span><div><h3>{active.patientName}</h3><p>{active.serviceName}</p></div><span className="elapsed"><i />In progress</span></div>
            <div className="queue-progress"><span style={{ width: `${Math.min(95, Math.max(12, data.metrics.averageWait * 3))}%` }} /></div>
            <div className="queue-summary"><span><b>{data.metrics.waiting}</b> waiting</span><span><b>{data.metrics.averageWait} min</b> est. wait</span><span><b>{upNext ? `T-${upNext.tokenNumber}` : "—"}</b> up next</span></div>
            <Link className="wide-button" href="/queue"><Stethoscope />Operate live queue</Link>
          </> : <div className="empty-state compact"><Activity /><h3>No active consultation</h3><p>{data.metrics.waiting ? "Call the next waiting patient when the room is ready." : "Checked-in patients will appear here."}</p><Link href="/queue">Open queue</Link></div>}
        </section>

        <section className="brief-card brief-card-v2">
          <div className="brief-icon"><Sparkles /></div>
          <div><p className="eyebrow">OPERATIONAL BRIEF</p><h3>Peak period: {peakWindow(data.appointments)}</h3><p>{data.metrics.appointments} appointments today, {data.metrics.newPatients} new patients, and {data.followUps.filter((item) => item.status === "OVERDUE").length} overdue follow-ups need attention.</p><Link href="/analytics">Open clinic pulse <ArrowRight /></Link></div>
        </section>

        {(data.metrics.cancelled > 0 || data.metrics.noShows > 0) && <section className="opportunity-card"><TriangleAlert /><div><b>{data.metrics.cancelled + data.metrics.noShows} recovery opportunities</b><span>{data.metrics.cancelled} cancellation · {data.metrics.noShows} no-show</span></div><Link href="/follow-ups"><ArrowRight /></Link></section>}
      </aside>
    </div>
  </div>;
}

function DashboardSkeleton() {
  return <div className="page-stack" aria-label="Loading command center"><div className="skeleton hero-skeleton" /><div className="metrics metrics-v2">{[1,2,3,4].map((item) => <div className="skeleton metric-skeleton" key={item} />)}</div><div className="dashboard-grid dashboard-grid-v2"><div className="skeleton panel-skeleton" /><div className="skeleton rail-skeleton" /></div></div>;
}

function DashboardError({ message, retry }: { message?: string; retry: () => void }) {
  return <section className="error-state"><TriangleAlert /><h2>Command center could not load</h2><p>{message ?? "The clinic data service is temporarily unavailable."}</p><button type="button" onClick={retry}><RefreshCw />Try again</button></section>;
}
