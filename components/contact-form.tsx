"use client";

import { FormEvent, useRef, useState } from "react";
import { CheckCircle, PaperPlaneTilt, WhatsappLogo } from "@phosphor-icons/react";
import { company } from "@/config/company";

const requiredFields = ["name", "phone", "workflow"] as const;

export function ContactForm(){
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  const [invalidFields,setInvalidFields]=useState<Set<string>>(new Set());
  const errorRef=useRef<HTMLParagraphElement>(null);

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
    if(missing.length){showValidationError(element,[...missing],"Please add your name, phone number and the workflow you want to improve.");return;}
    const phone=String(form.get("phone")||"").trim();
    if(phone.replace(/\D/g,"").length<8){showValidationError(element,["phone"],"Please check the phone or WhatsApp number.");return;}
    if(String(form.get("workflow")||"").trim().length<15){showValidationError(element,["workflow"],"Please add a little more detail so we can understand the workflow.");return;}
    setInvalidFields(new Set());setError("");
    const lines=[
      "Hello TORVENT, I would like to discuss a workflow.",
      `Name: ${String(form.get("name")||"").trim()}`,
      `Business: ${String(form.get("business")||"").trim()||"Not provided"}`,
      `Phone: ${phone}`,
      `Industry: ${String(form.get("industry")||"").trim()||"Not selected"}`,
      `Workflow: ${String(form.get("workflow")||"").trim()}`,
    ];
    const url=`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    const anchor=document.createElement("a");
    anchor.href=url;anchor.target="_blank";anchor.rel="noopener noreferrer";anchor.click();
    setSent(true);element.reset();
  }

  if(sent)return <div className="form-success" role="status"><CheckCircle weight="fill"/><p className="section-kicker">MESSAGE PREPARED</p><h2>Continue in WhatsApp.</h2><p>Review the prepared message and tap Send. TORVENT receives your enquiry only after you send it in WhatsApp.</p><button className="text-button" onClick={()=>setSent(false)}>Prepare another enquiry</button></div>;

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="contact-channel"><WhatsappLogo weight="duotone"/><span><b>Workflow enquiry through WhatsApp</b><small>{company.businessHours}</small></span></div>
    <div className="field-pair"><label>Your name<input name="name" autoComplete="name" required aria-invalid={invalidFields.has("name")} aria-describedby={invalidFields.has("name")?"form-error":undefined} placeholder="How should we address you?"/></label><label>Business name<input name="business" autoComplete="organization" placeholder="Your company or institution"/></label></div>
    <div className="field-pair"><label>Phone or WhatsApp<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={invalidFields.has("phone")} aria-describedby={invalidFields.has("phone")?"form-error":undefined} placeholder="Your contact number"/></label><label>Industry<select name="industry" defaultValue=""><option value="" disabled>Select your industry</option><option>Education</option><option>Healthcare</option><option>Real estate</option><option>Manufacturing</option><option>Service business</option><option>Other</option></select></label></div>
    <label>What would you like to improve?<textarea name="workflow" required minLength={15} rows={5} aria-invalid={invalidFields.has("workflow")} aria-describedby={invalidFields.has("workflow")?"form-error":undefined} placeholder="Describe where requests wait, information is repeated or follow-ups are missed."/></label>
    <label className="honeypot" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off"/></label>
    {error&&<p className="form-error" id="form-error" ref={errorRef} role="alert" tabIndex={-1}>{error}</p>}
    <button className="button form-submit" type="submit">Continue on WhatsApp <PaperPlaneTilt weight="fill"/></button>
    <small>WhatsApp opens with a prepared message. Review it before sending. Do not include confidential or sensitive customer data.</small>
  </form>;
}
