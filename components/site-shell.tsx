import { ArrowRight, MapPin, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Image from "next/image";
import { company } from "@/config/company";
import { SiteHeader } from "@/components/site-header-client";

export function Header() {
  return <SiteHeader/>;
}

const groups = [
  ["Solutions",[["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Process Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]]],
  ["AI Roles",[["Sales Agent","/ai-employees/sales-agent"],["Receptionist","/ai-employees/receptionist"],["Admission Officer","/ai-employees/admission-officer"],["Support Agent","/ai-employees/support-agent"]]],
  ["Industries",[["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Services","/industries/service-businesses"]]],
  ["Company",[["About","/about"],["Workflow Library","/case-studies"],["Trust","/trust"],["Insights","/insights"],["Contact","/contact"]]],
] as const;

export function Footer() {
  return <footer className="footer v2-footer"><div className="container footer-top"><div className="v2-footer-brand"><Link className="brand-logo-chip footer-logo" href="/" aria-label={`${company.displayName} home`}><Image src="/hbl-001-supreme-clinic-demo/torvent-logo.png" alt="TORVENT" width="2172" height="724"/></Link><p>Operational AI roles and connected workflows for real business work.</p><span className="footer-trust"><ShieldCheck/> Clear boundaries. Visible actions.</span><span className="v2-footer-place"><MapPin/> Hubballi, Karnataka, India</span></div><div className="footer-grid">{groups.map(([title,links])=><div key={title}><b>{title}</b>{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</div>)}</div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.displayName}. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></span></div></footer>;
}

export function CTA() { return <section className="cta-section v2-final-cta"><div className="container cta-grid"><div><p className="eyebrow">A PRACTICAL FIRST STEP</p><h2>Bring us one workflow that should work better.</h2></div><div><p>We will map the requests, knowledge, permitted actions, systems and human review needed for a responsible first pilot.</p><Link className="button button-light" href="/contact">Show Us Your Workflow <ArrowRight/></Link></div></div></section>; }
