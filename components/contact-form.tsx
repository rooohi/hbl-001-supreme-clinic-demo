"use client";

import { FormEvent, useRef, useState } from "react";
import { CheckCircle, CircleNotch, WhatsappLogo } from "@phosphor-icons/react";
import { company } from "@/config/company";

const requiredFields = ["name", "phone", "workflow"] as const;

export function ContactForm(){
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [sentMessage,setSentMessage]=useState("");
  const [error,setError]=useState("");
  const [invalidFields,setInvalidFields]=useState<Set<string>>(new Set());
  const errorRef=useRef<HTMLParagraphElement>(null);

  function showValidationError(element:HTMLFormElement, fields:string[], message:string){
    setInvalidFields(new Set(fields));
    setError(message);
    window.requestAnimationFrame(()=>{
      errorRef.current?.focus();
      element.querySelector<HTMLElement>(`[name="${fields[0]}"]`)?.focus();
    });
  }

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const element=event.currentTarget;
    const form=new FormData(element);
    const name=String(form.get("name")||"").trim();
    const email=String(form.get("email")||"").trim();
    const phone=String(form.get("phone")||"").trim();
    const workflow=String(form.get("workflow")||"").trim();

    if(String(form.get("company_website")||"")) return;
    const missing=requiredFields.filter(field=>!String(form.get(field)||"").trim());
    if(missing.length){
      showValidationError(element,[...missing],"Please add your name, phone number and the workflow you want to improve.");
      return;
    }
    if(phone.replace(/\D/g,"").length<8){
      showValidationError(element,["phone"],"Please add a valid phone or WhatsApp number.");
      return;
    }
    if(email&&!email.includes("@")){
      showValidationError(element,["email"],"Please check the optional email address or leave it blank.");
      return;
    }
    if(workflow.length<15){
      showValidationError(element,["workflow"],"Please add a little more detail so we can understand the workflow.");
      return;
    }

    setInvalidFields(new Set());
    setError("");
    setSending(true);
    try{
      if(company.formEndpoint){
        const payload=Object.fromEntries(form.entries());
        delete payload.company_website;
        const response=await fetch(company.formEndpoint,{
          method:"POST",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify(payload),
        });
        if(!response.ok) throw new Error("The form service could not accept this message.");
        setSentMessage("We have received your workflow and will respond during business hours.");
      }else{
        const message=[
          "Hello AI Automation Hubballi, I would like a workflow review.",
          "",
          `Name: ${name}`,
          `Business: ${String(form.get("business")||"Not provided")}`,
          `Phone: ${phone}`,
          `Email: ${email||"Not provided"}`,
          `Industry: ${String(form.get("industry")||"Not selected")}`,
          `Team size: ${String(form.get("teamSize")||"Not selected")}`,
          "",
          "Workflow:",
          workflow,
        ].join("\n");
        const whatsappUrl=`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(message)}`;
        const whatsappWindow=window.open(whatsappUrl,"_blank","noopener,noreferrer");
        if(!whatsappWindow) window.location.href=whatsappUrl;
        setSentMessage("WhatsApp has opened with your enquiry ready. Tap Send there to deliver it to Rohit.");
      }
      setSent(true);
      element.reset();
    }catch(submissionError){
      setError(submissionError instanceof Error?submissionError.message:"We could not prepare this message. Please try again.");
      window.requestAnimationFrame(()=>errorRef.current?.focus());
    }finally{
      setSending(false);
    }
  }

  if(sent)return <div className="form-success" role="status"><CheckCircle weight="fill"/><p className="section-kicker">ENQUIRY READY</p><h2>One more step in WhatsApp.</h2><p>{sentMessage}</p><button className="text-button" onClick={()=>setSent(false)}>Prepare another enquiry</button></div>;

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="contact-channel"><WhatsappLogo weight="fill"/><span><b>Replies through WhatsApp</b><small>{company.phone} · {company.businessHours}</small></span></div>
    <div className="field-pair"><label>Your name<input name="name" autoComplete="name" required aria-invalid={invalidFields.has("name")} aria-describedby={invalidFields.has("name")?"form-error":undefined} placeholder="How should we address you?"/></label><label>Business name<input name="business" autoComplete="organization" placeholder="Your company or institution"/></label></div>
    <div className="field-pair"><label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" required aria-invalid={invalidFields.has("phone")} aria-describedby={invalidFields.has("phone")?"form-error":undefined} placeholder="+91"/></label><label>Work email <small>Optional</small><input name="email" type="email" autoComplete="email" aria-invalid={invalidFields.has("email")} aria-describedby={invalidFields.has("email")?"form-error":undefined} placeholder="you@business.com"/></label></div>
    <div className="field-pair"><label>Industry<select name="industry" defaultValue=""><option value="" disabled>Select your industry</option><option>Education</option><option>Healthcare</option><option>Real estate</option><option>Manufacturing</option><option>Service business</option><option>Other</option></select></label><label>Team size<select name="teamSize" defaultValue=""><option value="" disabled>Select team size</option><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label></div>
    <label>What would you like to automate?<textarea name="workflow" required minLength={15} rows={5} aria-invalid={invalidFields.has("workflow")} aria-describedby={invalidFields.has("workflow")?"form-error":undefined} placeholder="For example: We receive 80–100 admission enquiries on WhatsApp each day. Our team repeats the same answers and misses follow-ups…"/></label>
    <label className="honeypot" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off"/></label>
    {error&&<p className="form-error" id="form-error" ref={errorRef} role="alert" tabIndex={-1}>{error}</p>}
    <button className="button form-submit" type="submit" disabled={sending}>{sending?<><CircleNotch className="spin"/> Preparing…</>:<>Continue in WhatsApp <WhatsappLogo weight="fill"/></>}</button>
    <small>Your details are placed into a WhatsApp message only after you continue. Review the message and tap Send to deliver it. Do not include sensitive customer data.</small>
  </form>;
}
