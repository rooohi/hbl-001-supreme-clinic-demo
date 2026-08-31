"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity, BarChart3, Bell, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound,
  ClipboardList, HeartPulse, Home, ListChecks, Mail, Menu, PackageSearch, Plus, ReceiptIndianRupee,
  Search, Settings, Stethoscope, Users, UserRoundCog, X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/types/clinic";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/queue", label: "Live queue", icon: Activity },
  { href: "/consultations", label: "Consultations", icon: ClipboardList },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/billing", label: "Billing", icon: ReceiptIndianRupee },
  { href: "/inventory", label: "Inventory", icon: PackageSearch },
  { href: "/follow-ups", label: "Follow-ups", icon: CheckCircle2 },
  { href: "/action-center", label: "Action center", icon: ListChecks },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/services", label: "Services", icon: Stethoscope },
  { href: "/team", label: "Team", icon: UserRoundCog },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type PatientSearchResult = {
  patients: Array<{ id: string; patientNumber: string; displayName: string; phoneLast4: string; visitCount: number }>;
};

export function ClinicShell({ children, title, eyebrow }: { children: React.ReactNode; title?: string; eyebrow?: string }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const active = navigation.find((item) => pathname === item.href) ?? navigation[0];
  const PageIcon = active.icon;
  const { data: patientResults, isFetching } = useQuery({
    queryKey: ["patient-search", query],
    queryFn: () => apiJson<PatientSearchResult>(`/api/patients?q=${encodeURIComponent(query)}`),
    enabled: paletteOpen && query.trim().length >= 2,
  });

  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPaletteOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
    window.requestAnimationFrame(() => restoreFocusRef.current?.focus());
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!paletteOpen) openPalette();
      }
      if (event.key === "Escape") {
        if (paletteOpen) {
          event.preventDefault();
          closePalette();
        }
        setMobileOpen(false);
      }
      if (event.key === "Tab" && paletteOpen && searchDialogRef.current) {
        const focusable = Array.from(searchDialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closePalette, openPalette, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 50);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [paletteOpen]);

  return (
    <div className="app-shell app-shell-v2">
      <aside className={`sidebar sidebar-v2 ${mobileOpen ? "open" : ""}`}>
        <Link href="/" className="brand-lockup brand-lockup-v2" aria-label="Twacha Clinic OS home">
          <span className="brand-crop"><Image src="/twacha-logo.png" alt="" width={1254} height={499} sizes="112px" priority /></span>
          <span><b>Clinic OS</b><small>Twacha · Tenant 01</small></span>
        </Link>
        <nav aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={selected ? "active" : ""} aria-current={selected ? "page" : undefined} onClick={() => setMobileOpen(false)}><Icon /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/book" className="booking-link"><HeartPulse /><span>Patient booking</span></Link>
          <div className="doctor-chip"><span>SD</span><div><b>Dr. Suman</b><small>Dermatologist</small></div><ChevronRight /></div>
        </div>
      </aside>

      <main className="workspace workspace-v2">
        <header className="topbar topbar-v2">
          <button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="page-context"><div className="page-icon"><PageIcon /></div><div><p>{eyebrow ?? active.label}</p><h1>{title ?? active.label}</h1></div></div>
          <div className="top-actions">
            <button className="search" type="button" onClick={openPalette} aria-haspopup="dialog" aria-expanded={paletteOpen} aria-controls="patient-search-dialog"><Search /><span>Search patients</span><kbd>Ctrl K</kbd></button>
            <button className="icon-button" type="button" aria-label="Notifications are not configured" disabled title="Notifications are not configured"><Bell /><span /></button>
            <Link className="primary-button" href="/appointments?new=1"><Plus />New appointment</Link>
            <div className="top-avatar" title="Dr. Suman"><CircleUserRound /></div>
          </div>
        </header>
        {children}
      </main>

      {mobileOpen && <button className="nav-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      {paletteOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePalette(); }}>
        <section ref={searchDialogRef} id="patient-search-dialog" className="command-palette" role="dialog" aria-modal="true" aria-label="Search patients">
          <header><Search /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or patient ID…" aria-label="Search patients" /><button type="button" onClick={closePalette} aria-label="Close patient search"><X /></button></header>
          <div className="command-results">
            {query.length < 2 && <div className="command-empty"><Search /><p>Type at least two characters.</p><span>Search stays tenant-scoped and returns at most 40 patients.</span></div>}
            {query.length >= 2 && isFetching && <div className="search-skeleton"><i /><i /><i /></div>}
            {query.length >= 2 && !isFetching && patientResults?.patients.length === 0 && <div className="command-empty"><Users /><p>No matching patients</p><span>Try a different name, number or patient ID.</span></div>}
            {patientResults?.patients.map((patient) => <Link href={`/patients?selected=${patient.id}`} key={patient.id} onClick={closePalette}><span className="mini-avatar">{patient.displayName.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span><span><b>{patient.displayName}</b><small>{patient.patientNumber} · •••• {patient.phoneLast4}</small></span><em>{patient.visitCount} visits</em><ChevronRight /></Link>)}
          </div>
          <footer><span><kbd>Esc</kbd> close</span><span>Twacha patient directory</span></footer>
        </section>
      </div>}
    </div>
  );
}
