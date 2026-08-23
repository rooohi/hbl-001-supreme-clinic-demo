"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarCheck, CheckCircle, DownloadSimple, Funnel, MagnifyingGlass, Plus, UploadSimple, WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { company } from "@/config/company";

const storageKey="aiautomationhubballi.crm.v1";
const stages=["New","Contacted","Qualified","Proposal","Won","Not a fit"] as const;
type Stage=(typeof stages)[number];
type Lead={id:string;name:string;business:string;phone:string;workflow:string;stage:Stage;followUp:string;notes:string;createdAt:string};

function isLead(value:unknown):value is Lead{
  if(!value||typeof value!=="object")return false;
  const lead=value as Partial<Lead>;
  return typeof lead.id==="string"&&typeof lead.name==="string"&&typeof lead.phone==="string"&&typeof lead.workflow==="string"&&stages.includes(lead.stage as Stage);
}

export function CrmWorkspace(){
  const [leads,setLeads]=useState<Lead[]>([]);
  const [ready,setReady]=useState(false);
  const [query,setQuery]=useState("");
  const [stageFilter,setStageFilter]=useState<"All"|Stage>("All");
  const [showForm,setShowForm]=useState(false);
  const [notice,setNotice]=useState("");
  const importRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const frame=window.requestAnimationFrame(()=>{
      try{
        const stored=window.localStorage.getItem(storageKey);
        if(stored){
          const parsed:unknown=JSON.parse(stored);
          if(Array.isArray(parsed))setLeads(parsed.filter(isLead));
        }
      }catch{setNotice("The saved CRM file on this browser could not be read.");}
      setReady(true);
    });
    return()=>window.cancelAnimationFrame(frame);
  },[]);

  useEffect(()=>{
    if(!ready)return;
    window.localStorage.setItem(storageKey,JSON.stringify(leads));
  },[leads,ready]);

  const filtered=useMemo(()=>{
    const term=query.trim().toLowerCase();
    return leads.filter(lead=>(stageFilter==="All"||lead.stage===stageFilter)&&(!term||[lead.name,lead.business,lead.phone,lead.workflow,lead.notes].some(value=>value.toLowerCase().includes(term))));
  },[leads,query,stageFilter]);

  function addLead(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    const name=String(data.get("name")||"").trim();
    const phone=String(data.get("phone")||"").trim();
    const workflow=String(data.get("workflow")||"").trim();
    if(!name||phone.replace(/\D/g,"").length<8||workflow.length<8){setNotice("Add a name, valid phone number and a short workflow note.");return;}
    const lead:Lead={
      id:crypto.randomUUID(),
      name,
      business:String(data.get("business")||"").trim(),
      phone,
      workflow,
      stage:"New",
      followUp:String(data.get("followUp")||""),
      notes:String(data.get("notes")||"").trim(),
      createdAt:new Date().toISOString(),
    };
    setLeads(current=>[lead,...current]);
    setNotice(`${name} added to the lead workspace.`);
    setShowForm(false);
    form.reset();
  }

  function updateLead(id:string,changes:Partial<Lead>){setLeads(current=>current.map(lead=>lead.id===id?{...lead,...changes}:lead));}

  function exportLeads(){
    const blob=new Blob([JSON.stringify(leads,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=url;
    anchor.download=`ai-automation-hubballi-leads-${new Date().toISOString().slice(0,10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Encrypted storage is not added to exports. Keep the downloaded file private.");
  }

  async function importLeads(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];
    if(!file)return;
    try{
      const parsed:unknown=JSON.parse(await file.text());
      if(!Array.isArray(parsed))throw new Error();
      const valid=parsed.filter(isLead);
      if(!valid.length&&parsed.length)throw new Error();
      const merged=new Map([...leads,...valid].map(lead=>[lead.id,lead]));
      setLeads(Array.from(merged.values()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
      setNotice(`${valid.length} lead${valid.length===1?"":"s"} imported.`);
    }catch{setNotice("That file is not a valid CRM export.");}
    event.target.value="";
  }

  const count=(stage:Stage)=>leads.filter(lead=>lead.stage===stage).length;

  return <main className="crm-shell">
    <header className="crm-header"><div><Link href="/"><ArrowLeft/> Public website</Link><span className="crm-kicker">LEAD WORKSPACE</span><h1>Simple CRM</h1><p>Track WhatsApp enquiries, next actions and outcomes on this browser.</p></div><div className="crm-header-actions"><button type="button" onClick={()=>importRef.current?.click()}><UploadSimple/> Import</button><input className="sr-only" ref={importRef} type="file" accept="application/json" onChange={importLeads}/><button type="button" onClick={exportLeads} disabled={!leads.length}><DownloadSimple/> Export</button><button className="crm-primary" type="button" onClick={()=>setShowForm(value=>!value)}><Plus/> Add lead</button></div></header>

    <section className="crm-privacy"><CheckCircle weight="fill"/><div><b>Device-local by design</b><p>Records stay in this browser and are not uploaded or synchronised. Export a private backup regularly. Automatic lead ingestion requires a secure backend later.</p></div></section>

    {notice&&<p className="crm-notice" role="status">{notice}</p>}

    {showForm&&<section className="crm-panel crm-add-panel"><div><span className="crm-kicker">NEW ENQUIRY</span><h2>Add a WhatsApp lead</h2><p>Copy only the business details needed for follow-up. Avoid sensitive customer information.</p></div><form onSubmit={addLead}><label>Name<input name="name" required autoComplete="off"/></label><label>Business<input name="business" autoComplete="off"/></label><label>Phone / WhatsApp<input name="phone" required type="tel" autoComplete="off"/></label><label>Follow-up date<input name="followUp" type="date"/></label><label className="crm-wide">Workflow<textarea name="workflow" required rows={3}/></label><label className="crm-wide">Notes<textarea name="notes" rows={2}/></label><div className="crm-wide crm-form-actions"><button type="button" onClick={()=>setShowForm(false)}>Cancel</button><button className="crm-primary" type="submit">Save lead</button></div></form></section>}

    <section className="crm-stats" aria-label="Pipeline summary">{stages.slice(0,5).map(stage=><button type="button" className={stageFilter===stage?"active":undefined} key={stage} onClick={()=>setStageFilter(stageFilter===stage?"All":stage)}><span>{stage}</span><b>{count(stage)}</b></button>)}</section>

    <section className="crm-toolbar"><label><MagnifyingGlass/><span className="sr-only">Search leads</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search name, business, phone or workflow"/></label><label><Funnel/><span className="sr-only">Filter by stage</span><select value={stageFilter} onChange={event=>setStageFilter(event.target.value as "All"|Stage)}><option>All</option>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></label></section>

    <section className="crm-list" aria-live="polite">{!ready?<div className="crm-empty">Loading this browser’s workspace…</div>:!filtered.length?<div className="crm-empty"><WhatsappLogo weight="duotone"/><h2>{leads.length?"No leads match this view.":"Your lead workspace is ready."}</h2><p>{leads.length?"Change the search or stage filter.":`When an enquiry arrives at ${company.phone}, add the person here and set the next follow-up.`}</p>{!leads.length&&<button className="crm-primary" type="button" onClick={()=>setShowForm(true)}><Plus/> Add first lead</button>}</div>:filtered.map(lead=><article className="crm-lead" key={lead.id}><header><div><span className="crm-avatar">{lead.name.slice(0,1).toUpperCase()}</span><span><b>{lead.name}</b><small>{lead.business||"Business not added"}</small></span></div><select aria-label={`Stage for ${lead.name}`} value={lead.stage} onChange={event=>updateLead(lead.id,{stage:event.target.value as Stage})}>{stages.map(stage=><option key={stage}>{stage}</option>)}</select></header><p>{lead.workflow}</p><div className="crm-lead-meta"><a href={`https://wa.me/${lead.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"><WhatsappLogo weight="fill"/> {lead.phone}</a><label><CalendarCheck/> Follow up <input aria-label={`Follow-up date for ${lead.name}`} type="date" value={lead.followUp} onChange={event=>updateLead(lead.id,{followUp:event.target.value})}/></label></div><label className="crm-notes">Notes<textarea aria-label={`Notes for ${lead.name}`} rows={2} value={lead.notes} onChange={event=>updateLead(lead.id,{notes:event.target.value})} placeholder="Add context, decision or next step"/></label><footer>Added {new Date(lead.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</footer></article>)}</section>
  </main>;
}
