"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Filter, LayoutGrid, List, Plus, RefreshCw, Search, TriangleAlert, Users, X } from "lucide-react";
import Link from "@/components/native-link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppointmentForm } from "./appointment-form";
import { apiJson, type Appointment } from "@/types/clinic";

type ViewMode = "day" | "week" | "month" | "agenda";

function indiaDate(offsetDays = 0) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + offsetDays * 86_400_000));
}

function formatTime(timestamp: number) { return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" }).format(timestamp); }
function prettyStatus(status: string) { return status.toLowerCase().replaceAll("_", " ").replace(/^./, (v) => v.toUpperCase()); }

export function AppointmentsView() {
  const client = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState(indiaDate());
  const [view, setView] = useState<ViewMode>("day");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const isFormOpen = formOpen || searchParams.get("new") === "1";
  const [notice, setNotice] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const query = useQuery({ queryKey: ["appointments", date], queryFn: () => apiJson<{ appointments: Appointment[]; date: string }>(`/api/appointments?date=${date}`) });
  const checkIn = useMutation({
    mutationFn: (id: string) => apiJson<{ queueEntry: { tokenNumber: number } }>(`/api/appointments/${id}/check-in`, { method: "POST" }),
    onSuccess: (result) => { setNotice(`Patient checked in as token T-${result.queueEntry.tokenNumber}.`); client.invalidateQueries({ queryKey: ["appointments"] }); client.invalidateQueries({ queryKey: ["queue"] }); client.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const appointments = useMemo(() => (query.data?.appointments ?? []).filter((item) => {
    const matchesSearch = !search || `${item.patientName} ${item.patientNumber} ${item.serviceName}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "ALL" || item.status === status;
    return matchesSearch && matchesStatus;
  }), [query.data, search, status]);

  const shiftDate = (days: number) => setDate(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(`${date}T12:00:00+05:30`).getTime() + days * 86_400_000));
  const dateLabel = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
  const monthDays = useMemo(() => {
    const [year, month] = date.split("-").map(Number);
    const count = new Date(year, month, 0).getDate();
    return Array.from({ length: count }, (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`);
  }, [date]);

  const openForm = useCallback((trigger?: HTMLElement) => {
    restoreFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    if (searchParams.get("new") === "1") router.replace("/appointments");
    window.requestAnimationFrame(() => restoreFocusRef.current?.focus());
  }, [router, searchParams]);

  useEffect(() => {
    if (!isFormOpen) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      const initial = dialog?.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
      (initial ?? dialog)?.focus();
    }, 0);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeForm();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeForm, isFormOpen]);

  return <div className="page-stack">
    <section className="page-heading"><div><p>Schedule</p><h2>Appointments</h2><span>Conflict-aware scheduling for Dr. Suman’s clinic day.</span></div><button className="primary-button" type="button" onClick={(event) => openForm(event.currentTarget)} aria-haspopup="dialog"><Plus />New appointment</button></section>
    {notice && <div className="success-banner"><CheckCircle2 /><span>{notice}</span><button type="button" onClick={() => setNotice(null)}><X /></button></div>}
    {checkIn.isError && <div className="error-banner"><TriangleAlert /><span>{checkIn.error.message}</span><button type="button" onClick={() => checkIn.reset()}><X /></button></div>}
    <section className="calendar-toolbar panel">
      <div className="date-navigation"><button type="button" onClick={() => shiftDate(view === "week" ? -7 : -1)} aria-label="Previous period"><ArrowLeft /></button><button className="date-title" type="button" onClick={() => setDate(indiaDate())}><CalendarDays /><span>{dateLabel}</span><small>{date === indiaDate() ? "Today" : "Return to today"}</small></button><button type="button" onClick={() => shiftDate(view === "week" ? 7 : 1)} aria-label="Next period"><ArrowRight /></button></div>
      <div className="view-switcher" aria-label="Calendar view">{(["day","week","month","agenda"] as const).map((mode) => <button type="button" key={mode} className={view === mode ? "active" : ""} onClick={() => setView(mode)}>{mode === "agenda" ? <List /> : mode === "month" ? <LayoutGrid /> : null}{mode[0].toUpperCase()+mode.slice(1)}</button>)}</div>
    </section>
    <section className="filter-bar"><label><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search today’s schedule" /></label><label><Filter /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="CONFIRMED">Confirmed</option><option value="ARRIVED">Arrived</option><option value="WAITING">Waiting</option><option value="IN_CONSULTATION">In consultation</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option><option value="NO_SHOW">No-show</option></select></label><span>{appointments.length} shown</span></section>

    {query.isLoading && <div className="skeleton panel-skeleton" />}
    {query.isError && <section className="error-state"><TriangleAlert /><h2>Appointments could not load</h2><p>{query.error.message}</p><button type="button" onClick={() => query.refetch()}><RefreshCw />Try again</button></section>}
    {!query.isLoading && !query.isError && view === "month" && <section className="month-grid panel">{monthDays.map((day) => { const active = day === date; return <button type="button" className={active ? "selected" : ""} key={day} onClick={() => setDate(day)}><small>{new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${day}T12:00:00+05:30`))}</small><b>{Number(day.slice(-2))}</b>{active && query.data!.appointments.length > 0 && <span>{query.data!.appointments.length} bookings</span>}</button>; })}</section>}
    {!query.isLoading && !query.isError && view === "week" && <section className="week-strip panel">{Array.from({ length: 6 }, (_, index) => { const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(`${date}T12:00:00+05:30`).getTime() + index * 86_400_000); return <button type="button" className={day === date ? "selected" : ""} key={day} onClick={() => setDate(day)}><small>{new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${day}T12:00:00+05:30`))}</small><b>{day.slice(-2)}</b><span>{day === date ? `${query.data!.appointments.length} appointments` : "Open day"}</span></button>; })}</section>}
    {!query.isLoading && !query.isError && view !== "month" && view !== "week" && <section className={`appointments-worklist panel ${view}`}>
      <header><div><p className="eyebrow">{view === "agenda" ? "AGENDA" : "DAY TIMELINE"}</p><h3>{dateLabel}</h3></div><span>Clinic hours 11:00 AM–6:00 PM</span></header>
      {appointments.map((appointment) => <article key={appointment.id}>
        <time>{formatTime(appointment.scheduledAt)}<small>{appointment.durationMinutes} min</small></time>
        <span className="worklist-line"><i /></span>
        <div className="worklist-person"><span className="avatar">{appointment.patientName.split(" ").map((word) => word[0]).join("").slice(0,2)}</span><div><b>{appointment.patientName}</b><small>{appointment.patientNumber} · •••• {appointment.phoneLast4}</small></div></div>
        <div className="worklist-service"><b>{appointment.serviceName}</b><small>{prettyStatus(appointment.type)} · {prettyStatus(appointment.source)}</small></div>
        <span className={`status status-${appointment.status.toLowerCase()}`}>{prettyStatus(appointment.status)}</span>
        <div className="row-actions">{["CONFIRMED","ARRIVED","SCHEDULED"].includes(appointment.status) && <button type="button" onClick={() => checkIn.mutate(appointment.id)} disabled={checkIn.isPending}><Users />Check in</button>}<Link href={`/patients?selected=${appointment.patientId}`} aria-label={`Open patient record for ${appointment.patientName}`} title="Open patient record"><ArrowRight /></Link></div>
      </article>)}
      {appointments.length === 0 && <div className="empty-state"><CalendarDays /><h3>No matching appointments</h3><p>Change the filters or create a new booking for this date.</p><button type="button" onClick={(event) => openForm(event.currentTarget)}><Plus />Create appointment</button></div>}
    </section>}
    {isFormOpen && <div className="modal-backdrop appointment-modal"><section ref={dialogRef} role="dialog" aria-modal="true" aria-label="Create appointment" tabIndex={-1}><AppointmentForm onClose={closeForm} onCreated={(result) => { closeForm(); setNotice(`Appointment confirmed for ${formatTime(result.scheduledAt)}.`); client.invalidateQueries({ queryKey: ["appointments"] }); client.invalidateQueries({ queryKey: ["dashboard"] }); }} /></section></div>}
  </div>;
}
