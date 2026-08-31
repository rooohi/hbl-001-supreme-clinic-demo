"use client";

import Link from "@/components/native-link";
import { useState } from "react";
import { ArrowRight, Buildings, Factory, GraduationCap, Heartbeat, Storefront } from "@phosphor-icons/react";

const industries = [
  {icon:GraduationCap,label:"Education",title:"From first question to a complete admission record.",entry:"Voice, WhatsApp and web enquiries",steps:["Answer approved programme questions","Collect applicant context","Schedule a campus visit"],boundary:"Policy or eligibility exceptions move to human review.",href:"/industries/education"},
  {icon:Heartbeat,label:"Healthcare",title:"Better access without automating clinical judgment.",entry:"Calls and appointment requests",steps:["Share approved service information","Offer permitted appointment slots","Route clinical questions to staff"],boundary:"Diagnosis and clinical advice always remain human.",href:"/industries/healthcare"},
  {icon:Buildings,label:"Real Estate",title:"Turn property interest into qualified visits.",entry:"Portal, phone and message enquiries",steps:["Understand budget and location","Match approved inventory","Coordinate a site visit"],boundary:"Pricing and negotiation stay within team rules.",href:"/industries/real-estate"},
  {icon:Factory,label:"Manufacturing",title:"Move requests from specification to accountable action.",entry:"RFQs, service requests and internal queues",steps:["Structure requirements","Route to the right team","Track the next committed step"],boundary:"Commercial approval and technical exceptions escalate.",href:"/industries/manufacturing"},
  {icon:Storefront,label:"Services",title:"Keep every enquiry moving toward booked work.",entry:"Website, phone and message requests",steps:["Qualify the need","Propose the right next step","Maintain follow-up visibility"],boundary:"Custom terms and uncertain requests move to review.",href:"/industries/service-businesses"},
] as const;

export function IndustrySelector(){
  const [active,setActive]=useState(0);
  const item=industries[active];
  return <div className="v2-industry-explorer">
    <div className="v2-industry-tabs" role="tablist" aria-label="Industry workflows">{industries.map(({icon:Icon,label},index)=><button role="tab" aria-selected={active===index} aria-controls="industry-preview" id={`industry-tab-${index}`} key={label} onClick={()=>setActive(index)} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)}><Icon weight="duotone"/><span>{label}</span><ArrowRight/></button>)}</div>
    <article className="v2-industry-preview" id="industry-preview" role="tabpanel" aria-labelledby={`industry-tab-${active}`}>
      <p className="section-kicker">{item.label.toUpperCase()} WORKFLOW</p>
      <h3>{item.title}</h3>
      <div className="v2-industry-entry"><small>ENTRY</small><b>{item.entry}</b></div>
      <ol>{item.steps.map((step,index)=><li key={step}><span>0{index+1}</span>{step}</li>)}</ol>
      <p className="v2-industry-boundary">{item.boundary}</p>
      <Link href={item.href}>Explore {item.label} <ArrowRight/></Link>
    </article>
  </div>;
}
