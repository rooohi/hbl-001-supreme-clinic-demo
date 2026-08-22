import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { company } from "@/config/company";

export function Header() {
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="container nav-inner">
    <Link className="wordmark" href="/" aria-label={`${company.displayName} home`}><span className="brand-glyph">AI</span>{company.displayName}</Link>
    <nav aria-label="Primary navigation"><Link href="/ai-agents">Solutions</Link><Link href="/ai-employees/sales-agent">AI Employees</Link><Link href="/industries/education">Industries</Link><Link href="/case-studies">Case Studies</Link><Link href="/insights">Insights</Link><Link href="/about">About</Link></nav>
    <Link className="button button-small desktop-cta" href="/contact">Show Us Your Workflow <ArrowRight /></Link>
    <details className="mobile-menu"><summary>Menu</summary><div><Link href="/ai-agents">Solutions</Link><Link href="/ai-employees/sales-agent">AI Employees</Link><Link href="/industries/education">Industries</Link><Link href="/case-studies">Case Studies</Link><Link href="/insights">Insights</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link></div></details>
  </div></header><span className="skip-target" id="main-content" tabIndex={-1}/></>;
}

const groups = [
  ["Solutions",[["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Business Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]]],
  ["AI Employees",[["AI Sales Agent","/ai-employees/sales-agent"],["AI Receptionist","/ai-employees/receptionist"],["AI Admission Officer","/ai-employees/admission-officer"],["AI Support Agent","/ai-employees/support-agent"]]],
  ["Industries",[["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Service Businesses","/industries/service-businesses"]]],
  ["Company",[["About","/about"],["Case Studies","/case-studies"],["Insights","/insights"],["Contact","/contact"]]],
] as const;

export function Footer() {
  return <footer className="footer"><div className="container footer-grid"><div><Link className="wordmark inverse" href="/"><span className="brand-glyph light">AI</span>{company.displayName}</Link><p>{company.tagline}</p><small>Hubballi, Karnataka, India</small></div>{groups.map(([title,links])=><div key={title}><b>{title}</b>{links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</div>)}</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.displayName}. All rights reserved.</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookie Policy</Link></span></div></footer>;
}

export function CTA() { return <section className="cta-section"><div className="container"><p className="eyebrow">START WITH ONE WORKFLOW</p><h2>What would you automate<br/>if AI could handle it tomorrow?</h2><div><Link className="button button-light" href="/contact">Show Us Your Workflow <ArrowRight /></Link><Link href="/contact" className="text-link light-link">Talk to Our Team</Link></div></div></section>; }
