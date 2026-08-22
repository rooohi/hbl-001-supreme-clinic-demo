import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { company } from "@/config/company";

export function Header() {
  return <header className="site-header"><div className="container nav-inner">
    <a className="wordmark" href="/"><span className="brand-glyph">A</span>{company.brandName}</a>
    <nav aria-label="Primary navigation"><a href="/ai-agents">Solutions</a><a href="/ai-employees/sales-agent">AI Employees</a><a href="/industries/education">Industries</a><a href="/case-studies">Case Studies</a><a href="/insights">Insights</a><a href="/about">About</a></nav>
    <a className="button button-small" href="/contact">Show Us Your Workflow <ArrowRight /></a>
  </div></header>;
}

const groups = [
  ["Solutions",[["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Business Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]]],
  ["AI Employees",[["AI Sales Agent","/ai-employees/sales-agent"],["AI Receptionist","/ai-employees/receptionist"],["AI Admission Officer","/ai-employees/admission-officer"],["AI Support Agent","/ai-employees/support-agent"]]],
  ["Industries",[["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Service Businesses","/industries/service-businesses"]]],
  ["Company",[["About","/about"],["Case Studies","/case-studies"],["Insights","/insights"],["Contact","/contact"]]],
] as const;

export function Footer() {
  return <footer className="footer"><div className="container footer-grid"><div><a className="wordmark inverse" href="/"><span className="brand-glyph light">A</span>{company.brandName}</a><p>{company.tagline}</p><small>Hubballi, Karnataka, India</small></div>{groups.map(([title,links])=><div key={title}><b>{title}</b>{links.map(([label,href])=><a href={href} key={href}>{label}</a>)}</div>)}</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.brandName}. All rights reserved.</span><span><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cookies">Cookie Policy</a></span></div></footer>;
}

export function CTA() { return <section className="cta-section"><div className="container"><p className="eyebrow">START WITH ONE WORKFLOW</p><h2>What would you automate<br/>if AI could handle it tomorrow?</h2><div><a className="button button-light" href="/contact">Show Us Your Workflow <ArrowRight /></a><a href="/contact" className="text-link light-link">Talk to Our Team</a></div></div></section>; }
