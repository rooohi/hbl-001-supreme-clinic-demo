"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CaretDown, WhatsappLogo } from "@phosphor-icons/react";
import { company } from "@/config/company";

const navigation = [
  { label: "Solutions", links: [["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Process Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]] },
  { label: "AI Roles", links: [["Sales Agent","/ai-employees/sales-agent"],["Receptionist","/ai-employees/receptionist"],["Admission Officer","/ai-employees/admission-officer"],["Support Agent","/ai-employees/support-agent"]] },
  { label: "Industries", links: [["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Service Businesses","/industries/service-businesses"]] },
  { label: "Company", links: [["About","/about"],["Workflow Library","/case-studies"],["Trust","/trust"],["Insights","/insights"],["Hubballi","/locations/hubli"],["Contact","/contact"]] },
] as const;

function isCurrent(pathname:string,href:string){return pathname===href||pathname===`${href}/`;}

export function SiteHeader(){
  const pathname=usePathname();
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="container nav-inner">
    <Link className="wordmark" href="/" aria-label={`${company.displayName} home`}><span className="brand-glyph">AI</span><span>{company.displayName}</span></Link>
    <nav aria-label="Primary navigation" className="desktop-navigation">{navigation.map(group=>{
      const active=group.links.some(([,href])=>isCurrent(pathname,href));
      return <details className="nav-dropdown" key={group.label}><summary className={active?"nav-active":undefined}>{group.label}<CaretDown/></summary><div className="nav-panel">{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div></details>;
    })}</nav>
    <Link className="nav-cta" href="/contact"><span>Show us one workflow</span><ArrowRight/></Link>
    <details className="mobile-menu"><summary>Menu</summary><div><div className="mobile-menu-primary"><Link className="mobile-menu-cta" href="/contact">Show us one workflow <ArrowRight/></Link><a className="mobile-whatsapp" href={`https://wa.me/${company.whatsappNumber}`} target="_blank" rel="noreferrer"><WhatsappLogo weight="fill"/> WhatsApp</a></div>{navigation.map(group=><section key={group.label}><b>{group.label}</b>{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}</Link>)}</section>)}</div></details>
  </div></header><span className="skip-target" id="main-content" tabIndex={-1}/></>;
}
