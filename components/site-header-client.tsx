"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowRight, CaretDown, WhatsappLogo } from "@phosphor-icons/react";
import { company } from "@/config/company";

const navigation = [
  { label: "Solutions", links: [["AI Agents","/ai-agents"],["Voice AI","/ai-voice-agents"],["WhatsApp Automation","/whatsapp-ai-automation"],["Process Automation","/business-process-automation"],["Custom AI","/custom-ai-development"]] },
  { label: "AI Roles", links: [["Sales Agent","/ai-employees/sales-agent"],["Receptionist","/ai-employees/receptionist"],["Admission Officer","/ai-employees/admission-officer"],["Support Agent","/ai-employees/support-agent"]] },
  { label: "Industries", links: [["Education","/industries/education"],["Healthcare","/industries/healthcare"],["Real Estate","/industries/real-estate"],["Manufacturing","/industries/manufacturing"],["Service Businesses","/industries/service-businesses"]] },
  { label: "Company", links: [["About","/about"],["Workflow Library","/case-studies"],["Trust","/trust"],["Hubballi","/locations/hubli"],["Contact","/contact"]] },
] as const;

function isCurrent(pathname:string,href:string){return pathname===href||pathname===`${href}/`;}

export function SiteHeader(){
  const pathname=usePathname();
  const mobileMenu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    mobileMenu.current?.removeAttribute("open");
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")mobileMenu.current?.removeAttribute("open")};
    window.addEventListener("keydown",closeOnEscape);
    return()=>window.removeEventListener("keydown",closeOnEscape);
  },[pathname]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><header className={`site-header torvent-header ${pathname==="/"?"torvent-header-home":""}`}><div className="container nav-inner">
    <Link className="brand-logo-chip interior-logo" href="/" aria-label={`${company.displayName} home`}><Image src="/hbl-001-supreme-clinic-demo/torvent-logo.png" alt="TORVENT" width="2172" height="724" priority/></Link>
    <nav aria-label="Primary navigation" className="desktop-navigation">{navigation.slice(0,3).map(group=>{
      const active=group.links.some(([,href])=>isCurrent(pathname,href));
      return <details className="nav-dropdown" key={group.label}><summary className={active?"nav-active":undefined}>{group.label}<CaretDown/></summary><div className="nav-panel">{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div></details>;
    })}<Link className={isCurrent(pathname,"/insights")?"standalone-nav nav-active":"standalone-nav"} href="/insights">Insights</Link>{navigation.slice(3).map(group=>{
      const active=group.links.some(([,href])=>isCurrent(pathname,href));
      return <details className="nav-dropdown" key={group.label}><summary className={active?"nav-active":undefined}>{group.label}<CaretDown/></summary><div className="nav-panel">{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div></details>;
    })}</nav>
    <Link className="header-primary-cta" href="/contact">Show Us Your Workflow <ArrowRight/></Link>
    <details className="mobile-menu" ref={mobileMenu}><summary>Menu</summary><div><div className="mobile-menu-primary"><Link className="mobile-menu-cta" href="/contact">Show Us Your Workflow <ArrowRight/></Link><a className="mobile-whatsapp" href={`https://wa.me/${company.whatsappNumber}`} target="_blank" rel="noreferrer"><WhatsappLogo weight="fill"/> WhatsApp</a></div><Link className="mobile-insights-link" href="/insights">Insights</Link>{navigation.map(group=><section key={group.label}><b>{group.label}</b>{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}</Link>)}</section>)}</div></details>
  </div></header><span className="skip-target" id="main-content" tabIndex={-1}/></>;
}
