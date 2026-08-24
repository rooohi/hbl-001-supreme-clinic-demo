"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CaretDown, List, WhatsappLogo, X } from "@phosphor-icons/react";
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
  const isHome=pathname==="/";
  const [homeMenuOpen,setHomeMenuOpen]=useState(false);

  useEffect(()=>{
    if(!homeMenuOpen)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setHomeMenuOpen(false)};
    const onResize=()=>{if(window.innerWidth>760)setHomeMenuOpen(false)};
    document.body.classList.add("cinematic-menu-open");
    window.addEventListener("keydown",onKey);
    window.addEventListener("resize",onResize);
    return()=>{document.body.classList.remove("cinematic-menu-open");window.removeEventListener("keydown",onKey);window.removeEventListener("resize",onResize)};
  },[homeMenuOpen]);

  if(isHome)return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header cinematic-header"><div className="cinematic-nav-wrap">
    <Link className="cinematic-logo brand-logo-chip" href="/" aria-label={`${company.displayName} home`}><Image src="/hbl-001-supreme-clinic-demo/torvent-logo.png" alt="TORVENT" width="2172" height="724" priority/></Link>
    <nav aria-label="Primary navigation" className="cinematic-nav-pill">
      <Link className="active" href="/" aria-current="page">Home</Link>
      <Link href="/ai-agents">AI systems</Link>
      <Link href="/case-studies">Workflows</Link>
      <Link href="/contact">Contact</Link>
    </nav>
    <button className={`cinematic-menu-button ${homeMenuOpen?"open":""}`} type="button" aria-label={homeMenuOpen?"Close navigation":"Open navigation"} aria-expanded={homeMenuOpen} onClick={()=>setHomeMenuOpen(value=>!value)}>{homeMenuOpen?<X/>:<List/>}</button>
  </div></header>{homeMenuOpen&&<div className="cinematic-menu-layer"><button className="cinematic-menu-backdrop" type="button" aria-label="Close navigation" onClick={()=>setHomeMenuOpen(false)}/><nav className="cinematic-menu-sheet" aria-label="Mobile navigation">
    <Link className="active" href="/" aria-current="page" onClick={()=>setHomeMenuOpen(false)}>Home</Link><Link href="/ai-agents" onClick={()=>setHomeMenuOpen(false)}>AI systems</Link><Link href="/case-studies" onClick={()=>setHomeMenuOpen(false)}>Workflow library</Link><Link href="/about" onClick={()=>setHomeMenuOpen(false)}>About</Link><Link href="/contact" onClick={()=>setHomeMenuOpen(false)}>Contact</Link>
  </nav></div>}<span className="skip-target" id="main-content" tabIndex={-1}/></>;

  return <><a className="skip-link" href="#main-content">Skip to content</a><header className="site-header"><div className="container nav-inner">
    <Link className="brand-logo-chip interior-logo" href="/" aria-label={`${company.displayName} home`}><Image src="/hbl-001-supreme-clinic-demo/torvent-logo.png" alt="TORVENT" width="2172" height="724" priority/></Link>
    <nav aria-label="Primary navigation" className="desktop-navigation">{navigation.map(group=>{
      const active=group.links.some(([,href])=>isCurrent(pathname,href));
      return <details className="nav-dropdown" key={group.label}><summary className={active?"nav-active":undefined}>{group.label}<CaretDown/></summary><div className="nav-panel">{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div></details>;
    })}</nav>
    <details className="mobile-menu"><summary>Menu</summary><div><div className="mobile-menu-primary"><Link className="mobile-menu-cta" href="/contact">Show us one workflow <ArrowRight/></Link><a className="mobile-whatsapp" href={`https://wa.me/${company.whatsappNumber}`} target="_blank" rel="noreferrer"><WhatsappLogo weight="fill"/> WhatsApp</a></div>{navigation.map(group=><section key={group.label}><b>{group.label}</b>{group.links.map(([label,href])=><Link href={href} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}</Link>)}</section>)}</div></details>
  </div></header><span className="skip-target" id="main-content" tabIndex={-1}/></>;
}
