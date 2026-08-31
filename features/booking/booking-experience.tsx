"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock3, ExternalLink, HeartPulse, MapPin, Phone, ShieldCheck, Stethoscope } from "lucide-react";
import { AppointmentForm } from "@/features/appointments/appointment-form";

type Confirmation = { id: string; scheduledAt: number; serviceName?: string; trackingToken?: string; trackingExpiresAt?: number };

function clinicOpen() {
  const parts = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", hour12: false }).formatToParts(new Date());
  const day = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  return day !== "Sun" && hour >= 11 && hour < 18;
}

export function BookingExperience() {
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const open = clinicOpen();
  if (confirmation) return <main className="booking-site confirmation-page"><div className="booking-container narrow-booking"><header className="booking-brand compact"><Image src="/twacha-logo.png" alt="Twacha Skin, Hair, Laser and Cosmetology Centre" width={1254} height={499} priority /></header><section className="confirmation-card"><span className="confirmation-icon"><CheckCircle2 /></span><p className="eyebrow">APPOINTMENT CONFIRMED</p><h1>You’re booked with Twacha.</h1><div className="confirmation-details"><span><CalendarCheck /><div><small>Date and time</small><b>{new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(confirmation.scheduledAt)}</b></div></span><span><Stethoscope /><div><small>Service</small><b>{confirmation.serviceName ?? "Clinic appointment"}</b></div></span></div><p className="confirmation-note">Your booking is recorded. Messaging is not connected, so save this protected status link now; it expires automatically.</p>{confirmation.trackingToken ? <Link className="primary-booking-button" href={`/track/${confirmation.trackingToken}`}>View protected booking status <ArrowRight /></Link> : <p className="form-error">A protected status link could not be created. Contact the clinic before leaving this page.</p>}<button type="button" onClick={() => { setBooking(false); setConfirmation(null); }}>Book another appointment</button></section></div></main>;

  return <main className="booking-site"><div className="booking-container"><header className="booking-header"><div className="booking-brand"><Image src="/twacha-logo.png" alt="Twacha Skin, Hair, Laser and Cosmetology Centre" width={1254} height={499} priority /></div><span className={`public-open-status ${open ? "open" : "closed"}`}><i />{open ? "Open now" : "Closed now"}</span></header>
    {!booking ? <><section className="booking-hero"><div className="booking-hero-copy"><p className="eyebrow">SKIN · HAIR · LASER · COSMETOLOGY</p><h1>Specialist care,<br/><span>booked simply.</span></h1><p>Choose a service and reserve a conflict-free appointment with Dr. Suman Odugoudar Dibbad. No app needed.</p><button className="primary-booking-button" type="button" onClick={() => setBooking(true)}>Book appointment <ArrowRight /></button><div className="booking-assurance"><span><ShieldCheck />Protected status link</span><span><Clock3 />About 60 seconds</span><span><CalendarCheck />Live availability</span></div></div><aside className="next-available-card"><div className="doctor-mark">SD</div><p>DERMATOLOGIST</p><h2>Dr. Suman Odugoudar Dibbad</h2><span>Monday–Saturday</span><b>11:00 AM–6:00 PM</b><button type="button" onClick={() => setBooking(true)}>See available appointments <ArrowRight /></button></aside></section><section className="patient-shortcuts"><article><HeartPulse /><div><b>Today’s queue</b><span>Track your token and estimated wait.</span></div><Link href="/track"><ArrowRight /></Link></article><article><CalendarCheck /><div><b>Existing booking</b><span>Open your protected booking-status link.</span></div><Link href="/track"><ArrowRight /></Link></article><article><MapPin /><div><b>Clinic information</b><span>Address will appear after clinic verification.</span></div><button type="button" disabled aria-label="Directions unavailable"><ExternalLink /></button></article><article><Phone /><div><b>Contact clinic</b><span>Phone number pending go-live verification.</span></div><button type="button" disabled aria-label="Phone unavailable"><ArrowRight /></button></article></section></> : <section className="public-booking-flow"><div className="booking-flow-intro"><button type="button" onClick={() => setBooking(false)}>← Back</button><p className="eyebrow">ONLINE BOOKING</p><h1>Choose your appointment</h1><p>Only times that are currently free are shown.</p></div><AppointmentForm publicMode onCreated={setConfirmation} /></section>}
    <footer className="booking-footer"><span>© 2026 Twacha Clinic</span><span>Administrative booking only · For medical emergencies, contact local emergency services.</span></footer>
  </div></main>;
}
