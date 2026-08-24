"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CaretDown, List, X } from "@phosphor-icons/react";
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
  const [openGroup,setOpenGroup]=useState<string|null>(null);
  const [mobileOpen,setMobileOpen]=useState(false);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const headerRef=useRef<HTMLElement>(null);

  const open=(label:string)=>{if(closeTimer.current)clearTimeout(closeTimer.current);setOpenGroup(label);};
  const delayedClose=()=>{closeTimer.current=setTimeout(()=>setOpenGroup(null),140);};
  const closeNavigation=()=>{setOpenGroup(null);setMobileOpen(false);};

  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key!=="Escape")return;
      setOpenGroup(null);setMobileOpen(false);
      headerRef.current?.querySelector<HTMLElement>("[aria-expanded='true']")?.focus();
    };
    window.addEventListener("keydown",onKeyDown);
    return()=>{window.removeEventListener("keydown",onKeyDown);if(closeTimer.current)clearTimeout(closeTimer.current);};
  },[]);

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header ref={headerRef} className={`site-header torvent-header ${pathname==="/"?"torvent-header-home":""}`}>
      <div className="v2-header-frame">
        <Link className="brand-logo-chip v2-brand" href="/" onClick={closeNavigation} aria-label={`${company.displayName} home`}><Image src="/hbl-001-supreme-clinic-demo/torvent-logo.png" alt="TORVENT" width="2172" height="724" priority/></Link>
        <nav aria-label="Primary navigation" className="desktop-navigation v2-desktop-nav">
          {navigation.slice(0,3).map(group=>{
            const active=group.links.some(([,href])=>isCurrent(pathname,href));
            const expanded=openGroup===group.label;
            return <div className="v2-nav-group" key={group.label} onMouseEnter={()=>open(group.label)} onMouseLeave={delayedClose} onFocus={()=>open(group.label)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))delayedClose();}}>
              <button className={active?"nav-active":undefined} type="button" aria-expanded={expanded} aria-controls={`menu-${group.label}`} onClick={()=>setOpenGroup(expanded?null:group.label)}>{group.label}<CaretDown/></button>
              <div className="v2-nav-panel" id={`menu-${group.label}`} hidden={!expanded}>{group.links.map(([label,href])=><Link href={href} onClick={closeNavigation} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div>
            </div>;
          })}
          <Link className={isCurrent(pathname,"/insights")?"standalone-nav nav-active":"standalone-nav"} href="/insights" onClick={closeNavigation}>Insights</Link>
          {navigation.slice(3).map(group=>{
            const active=group.links.some(([,href])=>isCurrent(pathname,href));
            const expanded=openGroup===group.label;
            return <div className="v2-nav-group" key={group.label} onMouseEnter={()=>open(group.label)} onMouseLeave={delayedClose} onFocus={()=>open(group.label)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))delayedClose();}}>
              <button className={active?"nav-active":undefined} type="button" aria-expanded={expanded} aria-controls={`menu-${group.label}`} onClick={()=>setOpenGroup(expanded?null:group.label)}>{group.label}<CaretDown/></button>
              <div className="v2-nav-panel v2-nav-panel-right" id={`menu-${group.label}`} hidden={!expanded}>{group.links.map(([label,href])=><Link href={href} onClick={closeNavigation} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}<ArrowRight/></Link>)}</div>
            </div>;
          })}
        </nav>
        <Link className="header-primary-cta" href="/contact" onClick={closeNavigation}>Show Us Your Workflow <ArrowRight/></Link>
        <button className="v2-mobile-trigger" type="button" aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen?"Close navigation":"Open navigation"} onClick={()=>setMobileOpen(value=>!value)}>{mobileOpen?<X/>:<List/>}</button>
      </div>
      <nav id="mobile-navigation" className="v2-mobile-nav" aria-label="Mobile navigation" hidden={!mobileOpen}>
        <Link className="mobile-menu-cta" href="/contact" onClick={closeNavigation}>Show Us Your Workflow <ArrowRight/></Link>
        <Link className="mobile-insights-link" href="/insights" onClick={closeNavigation}>Insights</Link>
        {navigation.map(group=><details key={group.label}><summary>{group.label}<CaretDown/></summary><div>{group.links.map(([label,href])=><Link href={href} onClick={closeNavigation} key={href} aria-current={isCurrent(pathname,href)?"page":undefined}>{label}</Link>)}</div></details>)}
      </nav>
    </header>
    <span className="skip-target" id="main-content" tabIndex={-1}/>
  </>;
}
