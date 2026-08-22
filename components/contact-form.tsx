"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { company } from "@/config/company";

export function ContactForm(){
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=new FormData(e.currentTarget);
    const name=String(form.get("name")||"").trim();
    const email=String(form.get("email")||"").trim();
    const workflow=String(form.get("workflow")||"").trim();
    if(!name||!email.includes("@")||workflow.length<15){setError("Please add your name, a valid work email and a little more detail about the workflow.");return}
    setError(""); setSent(true);
    if(!company.email.startsWith("{{")){
      const subject=encodeURIComponent(`Workflow enquiry from ${name}`);
      const body=encodeURIComponent(`Name: ${name}\nBusiness: ${form.get("business")}\nEmail: ${email}\nPhone: ${form.get("phone")}\nIndustry: ${form.get("industry")}\n\nWorkflow:\n${workflow}`);
      window.location.href=`mailto:${company.email}?subject=${subject}&body=${body}`;
    }
  }
  if(sent)return <div className="form-success"><CheckCircle weight="fill"/><p className="section-kicker">ENQUIRY PREPARED</p><h2>Thank you. This is a useful starting point.</h2><p>{company.email.startsWith("{{")?"The form is working, but the real company email must be added in config/company.ts before public launch.":"Your email app has been opened with the workflow details ready to send."}</p><button className="text-button" onClick={()=>setSent(false)}>Send another enquiry</button></div>;
  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="field-pair"><label>Your name<input name="name" autoComplete="name" required placeholder="How should we address you?"/></label><label>Business name<input name="business" autoComplete="organization" placeholder="Your company or institution"/></label></div>
    <div className="field-pair"><label>Work email<input name="email" type="email" autoComplete="email" required placeholder="you@business.com"/></label><label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+91"/></label></div>
    <label>Industry<select name="industry" defaultValue=""><option value="" disabled>Select your industry</option><option>Education</option><option>Healthcare</option><option>Real estate</option><option>Manufacturing</option><option>Service business</option><option>Other</option></select></label>
    <label>What would you like to automate?<textarea name="workflow" required minLength={15} rows={6} placeholder="For example: We receive 80–100 admission enquiries on WhatsApp each day. Our team repeats the same answers and misses follow-ups…"/></label>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="button form-submit" type="submit">Request AI Consultation <ArrowRight/></button>
    <small>Do not include passwords, patient records, financial data or other sensitive information.</small>
  </form>
}
