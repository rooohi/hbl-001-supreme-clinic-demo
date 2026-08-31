import Image from "next/image";
import Link from "@/components/native-link";
import { ArrowLeft, KeyRound, ShieldCheck, UserRoundCheck } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const membership = reason === "membership";
  return <main className="booking-site auth-page">
    <div className="booking-container narrow-booking">
      <header className="booking-brand compact"><Image src="/twacha-logo.png" alt="Twacha Skin, Hair, Laser and Cosmetology Centre" width={1254} height={499} priority /></header>
      <section className="confirmation-card auth-card">
        <span className="confirmation-icon"><KeyRound /></span>
        <p className="eyebrow">STAFF WORKSPACE</p>
        <h1>{membership ? "Clinic membership required." : "Secure sign-in required."}</h1>
        <p className="confirmation-note">{membership
          ? "Your verified identity is not an active Twacha staff member. Ask the clinic owner to invite the exact email used for workspace access."
          : "Open this workspace through its approved private access screen. Twacha does not accept passwords or unverified identities on this page."}</p>
        <div className="auth-boundaries">
          <span><ShieldCheck /><div><b>Fail closed</b><small>Unknown identities cannot enter the staff workspace.</small></div></span>
          <span><UserRoundCheck /><div><b>Persisted membership</b><small>API permissions come from the active clinic staff record.</small></div></span>
        </div>
        <Link className="primary-booking-button" href="/">Try workspace access again</Link>
        <Link className="back-booking-link" href="/book"><ArrowLeft />Open patient booking</Link>
      </section>
    </div>
  </main>;
}
