"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle, CircleNotch } from "@phosphor-icons/react";
import { company } from "@/config/company";

export function ContactForm(){
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [sentMessage,setSentMessage]=useState("");
  const [error,setError]=useState("");

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const element=event.currentTarget;
    const form=new FormData(element);
    const name=String(form.get("name")||"").trim();
    const email=String(form.get("email")||"").trim();
    const phone=String(form.get("phone")||"").trim();
    const contactMethod=String(form.get("contactMethod")||"Email");
    const workflow=String(form.get("workflow")||"").trim();
    const supportEmail=String(company.email).trim();

    if(String(form.get("company_website")||"")) return;
    if(!name||!email.includes("@")||workflow.length<15){
      setError("Please add your name, a valid work email and a little more detail about the workflow.");
      return;
    }
    if((contactMethod==="Phone"||contactMethod==="WhatsApp")&&phone.length<8){
      setError(`Please add a phone number so we can contact you by ${contactMethod}.`);
      return;
    }

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
        setSentMessage("We’ve received your workflow. We’ll review the process, systems and decision points before replying through your selected contact method.");
        setSent(true);
        element.reset();
      }else if(supportEmail){
        const subject=encodeURIComponent(`Workflow enquiry from ${name}`);
        const body=encodeURIComponent(`Name: ${name}\nBusiness: ${form.get("business")}\nEmail: ${email}\nPhone: ${form.get("phone")}\nIndustry: ${form.get("industry")}\nTeam size: ${form.get("teamSize")}\nPreferred contact: ${form.get("contactMethod")}\n\nWorkflow:\n${workflow}`);
        window.location.href=`mailto:${supportEmail}?subject=${subject}&body=${body}`;
        setSentMessage("Your email app has opened with the workflow details ready to send.");
        setSent(true);
      }else{
        throw new Error("The consultation form needs the company email or form endpoint before it can send enquiries.");
      }
    }catch(submissionError){
      setError(submissionError instanceof Error?submissionError.message:"We could not send this message. Please try again.");
    }finally{
      setSending(false);
    }
  }

  if(sent)return <div className="form-success" role="status"><CheckCircle weight="fill"/><p className="section-kicker">ENQUIRY READY</p><h2>Thank you. This is a useful starting point.</h2><p>{sentMessage}</p><button className="text-button" onClick={()=>setSent(false)}>Send another enquiry</button></div>;

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="field-pair"><label>Your name<input name="name" autoComplete="name" required placeholder="How should we address you?"/></label><label>Business name<input name="business" autoComplete="organization" placeholder="Your company or institution"/></label></div>
    <div className="field-pair"><label>Work email<input name="email" type="email" autoComplete="email" required placeholder="you@business.com"/></label><label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+91"/></label></div>
    <div className="field-pair"><label>Industry<select name="industry" defaultValue=""><option value="" disabled>Select your industry</option><option>Education</option><option>Healthcare</option><option>Real estate</option><option>Manufacturing</option><option>Service business</option><option>Other</option></select></label><label>Team size<select name="teamSize" defaultValue=""><option value="" disabled>Select team size</option><option>1–10</option><option>11–50</option><option>51–200</option><option>201+</option></select></label></div>
    <label>What would you like to automate?<textarea name="workflow" required minLength={15} rows={5} placeholder="For example: We receive 80–100 admission enquiries on WhatsApp each day. Our team repeats the same answers and misses follow-ups…"/></label>
    <fieldset className="contact-method"><legend>How should we contact you?</legend><label><input name="contactMethod" type="radio" value="Email" defaultChecked/> Email</label><label><input name="contactMethod" type="radio" value="Phone"/> Phone</label><label><input name="contactMethod" type="radio" value="WhatsApp"/> WhatsApp</label></fieldset>
    <label className="honeypot" aria-hidden="true">Company website<input name="company_website" tabIndex={-1} autoComplete="off"/></label>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button form-submit" type="submit" disabled={sending}>{sending?<><CircleNotch className="spin"/> Sending…</>:<>Send workflow for review <ArrowRight/></>}</button>
    <small>Your information is used only to understand and respond to this enquiry. Do not include sensitive customer data.</small>
  </form>
}
