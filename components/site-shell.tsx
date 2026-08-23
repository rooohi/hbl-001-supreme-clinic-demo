import { ArrowRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { company } from "@/config/company";
import { SiteHeader } from "@/components/site-header-client";

export function Header() {
  return <SiteHeader/>;
}

const groups = [
  ["Solutions",[["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Process Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]]],
  ["AI Roles",[["Sales Agent","/ai-employees/sales-agent"],["Receptionist","/ai-employees/receptionist"],["Admission Officer","/ai-employees/admission-officer"],["Support Agent","/ai-employees/support-agent"]]],
  ["Industries",[["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Services","/industries/service-businesses"]]],
  ["Company",[["About","/about"],["Workflow Library","/case-studies"],["Insights","/insights"],["Contact","/contact"]]],
] as const;

export function Footer() {
  return <footer className="footer"><div className="container footer-top"><div><Link className="wordmark inverse" href="/"><span className="brand-glyph light">AI</span><span>{company.displayName}</span></Link><p>Responsible AI systems for the work your business does every day.</p><span className="footer-trust"><ShieldCheck/> Human accountability by design</span></div><div className="footer-place"><small>BUILT FROM</small><b>Hubballi, Karnataka</b><p>Designed for growing teams across <span className="india-word">India</span>.</p></div></div><div className="container footer-grid">{groups.map(([title,links])=><div key={title}><b>{title}</b>{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</div>)}</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.displayName}. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></span></div></footer>;
}

export function CTA() { return <section className="cta-section"><div className="container cta-grid"><div><p className="eyebrow">FIND THE RIGHT FIRST USE CASE</p><h2>Start with the workflow that costs your team the most time.</h2></div><div><p>Tell us where requests wait, information gets re-entered or follow-ups are missed. We will map the opportunity, boundaries and evidence needed for a useful first pilot.</p><Link className="button button-light" href="/contact">Request a workflow review <ArrowRight/></Link></div></div></section>; }
