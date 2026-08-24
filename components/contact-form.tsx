"use client";

import { FormEvent, useRef, useState } from "react";
import { CheckCircle, CircleNotch, GearSix, PaperPlaneTilt } from "@phosphor-icons/react";
import { company } from "@/config/company";

const requiredFields = ["name", "email", "workflow"] as const;

export function ContactForm(){
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  const [invalidFields,setInvalidFields]=useState<Set<string>>(new Set());
  const errorRef=useRef<HTMLParagraphElement>(null);

  if(!company.formEndpoint)return <div className="contact-form contact-unavailable" role="status">
    <GearSix weight="duotone"/>
    <p className="section-kicker">CONTACT CHANNEL STATUS</p>
    <h2>Business enquiries are being configured.</h2>
    <p>TORVENT has not published a business email or enabled a secure form endpoint yet. No information can be submitted from this page today.</p>
    <div><b>Launch TODO</b><span>Connect and test a secure business form endpoint before accepting enquiries.</span></div>
  </div>;

  function showValidationError(element:HTMLFormElement,fields:string[],message:string){
    setInvalidFields(new Set(fields));setError(message);
    window.requestAnimationFrame(()=>{errorRef.current?.focus();element.querySelector<HTMLElement>(`[name="${fields[0]}"]`)?.focus();});
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const element=event.currentTarget;
    const form=new FormData(element);
    if(String(form.get("company_website")||""))return;
    const missing=requiredFields.filter(field=>!String(form.get(field)||"").trim());
    if(missing.length){showValidationError(element,[...missing],"Please add your name, work email and the workflow you want to improve.");return;}
    const email=String(form.get("email")||"").trim();
    if(!email.includes("@")){showValidationError(element,["email"],"Please check the work email address.");return;}
    if(String(form.get("workflow")||"").trim().length<15){showValidationError(element,["workflow"],"Please add a little more detail so we can understand the workflow.");return;}
    setInvalidFields(new Set());setError("");setSending(true);
    try{
      const payload=Object.fromEntries(form.entries());delete payload.company_website;
      const response=await fetch(company.formEndpoint,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error("The enquiry service could not accept this message.");
      setSent(true);element.reset();
    }catch(submissionError){setError(submissionError instanceof Error?submissionError.message:"We could not send this enquiry. Please try again.");window.requestAnimationFrame(()=>errorRef.current?.focus());}
    finally{setSending(false);}
  }

  if(sent)return <div className="form-success" role="status"><CheckCircle weight="fill"/><p className="section-kicker">ENQUIRY RECEIVED</p><h2>Thank you.</h2><p>Your workflow has been received. The TORVENT team will respond through the business contact details you provided.</p><button className="text-button" onClick={()=>setSent(false)}>Send another enquiry</button></div>;

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="contact-channel"><PaperPlaneTilt weight="duotone"/><span><b>Secure workflow enquiry</b><small>{company.businessHours}</small></span></div>
    <div className="field-pair"><label>Your name<input name="name" autoComplete="name" required aria-invalid={invalidFields.has("name")} aria-describedby={invalidFields.has("name")?"form-error":undefined} placeholder="How should we address you?"/></label><label>Business name<input name="business" autoComplete="organization" placeholder="Your company or institution"/></label></div>
    <div className="field-pair"><label>Work email<input name="email" type="email" autoComplete="email" required aria-invalid={invalidFields.has("email")} aria-describedby={invalidFields.has("email")?"form-error":undefined} placeholder="you@business.com"/></label><label>Industry<select name="industry" defaultValue=""><option value="" disabled>Select your industry</option><option>Education</option><option>Healthcare</option><option>Real estate</option><option>Manufacturing</option><option>Service business</option><option>Other</option></select></label></div>
    <label>What would you like to improve?<textarea name="workflow" required minLength={15} rows={5} aria-invalid={invalidFields.has("workflow")} aria-describedby={invalidFields.has("workflow")?"form-error":undefined} placeholder="Describe where requests wait, information is repeated or follow-ups are missed."/></label>
    <label className="honeypot" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off"/></label>
    {error&&<p className="form-error" id="form-error" ref={errorRef} role="alert" tabIndex={-1}>{error}</p>}
    <button className="button form-submit" type="submit" disabled={sending}>{sending?<><CircleNotch className="spin"/> Sending…</>:<>Send Workflow <PaperPlaneTilt weight="fill"/></>}</button>
    <small>Do not include personal, confidential or sensitive customer data.</small>
  </form>;
}
