import { ArrowRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { company } from "@/config/company";

const primary = [
  ["Solutions", "/ai-agents"],
  ["AI Workforce", "/ai-employees/sales-agent"],
  ["Industries", "/industries/education"],
  ["Company", "/about"],
] as const;

export function Header() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="container nav-inner">
    <Link className="wordmark" href="/" aria-label={`${company.displayName} home`}><span className="brand-glyph">AI</span><span>{company.displayName}</span></Link>
    <nav aria-label="Primary navigation">{primary.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}<Link href="/insights">Insights</Link></nav>
    <Link className="nav-cta" href="/contact"><span>Plan a pilot</span><ArrowRight/></Link>
    <details className="mobile-menu"><summary>Menu</summary><div>{primary.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}<Link href="/insights">Insights</Link><Link className="mobile-menu-cta" href="/contact">Plan a pilot <ArrowRight/></Link></div></details>
  </div></header><span className="skip-target" id="main-content" tabIndex={-1}/></>;
}

const groups = [
  ["Solutions",[["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Process Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]]],
  ["AI Workforce",[["Sales Agent","/ai-employees/sales-agent"],["Receptionist","/ai-employees/receptionist"],["Admission Officer","/ai-employees/admission-officer"],["Support Agent","/ai-employees/support-agent"]]],
  ["Industries",[["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Services","/industries/service-businesses"]]],
  ["Company",[["About","/about"],["Case Studies","/case-studies"],["Insights","/insights"],["Contact","/contact"]]],
] as const;

export function Footer() {
  return <footer className="footer"><div className="container footer-top"><div><Link className="wordmark inverse" href="/"><span className="brand-glyph light">AI</span><span>{company.displayName}</span></Link><p>Responsible AI systems for the work your business does every day.</p><span className="footer-trust"><ShieldCheck/> Human oversight by design</span></div><div className="footer-place"><small>BUILT FROM</small><b>Hubballi, Karnataka</b><p>Working with ambitious teams across <span className="india-word">India</span>.</p></div></div><div className="container footer-grid">{groups.map(([title,links])=><div key={title}><b>{title}</b>{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</div>)}</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.displayName}. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link></span></div></footer>;
}

export function CTA() { return <section className="cta-section"><div className="container cta-grid"><div><p className="eyebrow">START WITH ONE CONTROLLED PILOT</p><h2>One workflow.<br/>A measurable result.</h2></div><div><p>Bring us the process that costs your team the most time. We will map the opportunity, risks, integrations and success measures before anything is built.</p><Link className="button button-light" href="/contact">Plan your first pilot <ArrowRight/></Link></div></div></section>; }
