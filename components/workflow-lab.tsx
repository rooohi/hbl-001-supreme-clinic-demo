"use client";

import { useState } from "react";
import { CheckCircle, Sparkle } from "@phosphor-icons/react";

const demos = {
  Admissions: {
    incoming: "BCA admission fees eshtu?",
    language: "Kannada + English",
    intent: "BCA admission enquiry",
    answer: "Approved fee details shared",
    action: "Student captured · campus visit offered",
    system: "Admissions CRM updated",
  },
  Sales: {
    incoming: "We need automation for our 3 branches.",
    language: "English",
    intent: "Multi-location, high-intent lead",
    answer: "Relevant solution and discovery questions sent",
    action: "Lead qualified · consultation booked",
    system: "Sales pipeline updated",
  },
  Reception: {
    incoming: "Tomorrow 4 pm appointment sigutta?",
    language: "Kannada + English",
    intent: "Appointment request",
    answer: "Live availability checked",
    action: "Slot held · confirmation sent",
    system: "Calendar updated",
  },
} as const;

type DemoKey = keyof typeof demos;

export function WorkflowLab() {
  const [active, setActive] = useState<DemoKey>("Admissions");
  const demo = demos[active];
  return <div className="lab-shell" id="workflow-lab">
    <div className="lab-toolbar">
      <span><i/><i/><i/></span>
      <b>WORKFLOW LAB</b>
      <em>Interactive example</em>
    </div>
    <div className="lab-tabs" role="tablist" aria-label="Choose an AI employee">
      {(Object.keys(demos) as DemoKey[]).map(label=><button role="tab" aria-selected={active===label} className={active===label?"active":""} onClick={()=>setActive(label)} key={label}>{label}</button>)}
    </div>
    <div className="lab-canvas" aria-live="polite">
      <div className="lab-message"><small>CUSTOMER · WHATSAPP</small><p>“{demo.incoming}”</p><span>{demo.language}</span></div>
      <div className="lab-path"><i/><i/><i/><i/></div>
      <div className="lab-results">
        <div><CheckCircle weight="fill"/><span><small>UNDERSTOOD</small>{demo.intent}</span></div>
        <div><CheckCircle weight="fill"/><span><small>ANSWERED</small>{demo.answer}</span></div>
        <div><Sparkle weight="fill"/><span><small>ACTED</small>{demo.action}</span></div>
        <div><CheckCircle weight="fill"/><span><small>CONNECTED</small>{demo.system}</span></div>
      </div>
    </div>
    <p className="lab-note">Example workflow · Final actions and integrations are configured for each business.</p>
  </div>;
}
