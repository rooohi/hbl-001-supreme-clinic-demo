"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CheckCircle, CirclesFour, PaperPlaneTilt, ShieldCheck, Sparkle, User, X } from "@phosphor-icons/react";

const starters = [
  "Handle admission enquiries",
  "Coordinate clinic appointments",
  "Triage manufacturing RFQs",
];

type Blueprint = {
  title: string;
  summary: string;
  steps: { label: string; detail: string }[];
};

type Message = {
  role: "user" | "assistant";
  text: string;
  blueprint?: Blueprint;
};

function createBlueprint(prompt: string): Blueprint {
  const request = prompt.toLowerCase();
  const toolDetail = request.includes("crm") ? " Update the CRM with the captured details and outcome." : "";
  const reviewDetail = request.includes("approval") || request.includes("approve")
    ? " Pause before the final action and request approval from the named owner."
    : " Record the outcome and send uncertain or sensitive cases to a named owner.";
  const context = request.includes("admission") || request.includes("student")
    ? { title: "Admission enquiry workflow", record: "student interest, course, location and visit preference", action: "answer approved questions and schedule a counsellor or campus visit" }
    : request.includes("clinic") || request.includes("patient") || request.includes("appointment")
      ? { title: "Clinic access workflow", record: "service, preferred time and safe contact details", action: "offer permitted slots and route clinical questions to staff" }
      : request.includes("rfq") || request.includes("manufact") || request.includes("quotation")
        ? { title: "RFQ intake workflow", record: "part, quantity, specification, deadline and buyer details", action: "create a complete request and route exceptions to the commercial team" }
        : { title: "Customer request workflow", record: "intent, required details, urgency and preferred next step", action: "complete the approved next action or prepare a human handoff" };

  return {
    title: context.title,
    summary: "A controlled first version that reduces repeat coordination while keeping decisions and exceptions with your team.",
    steps: [
      { label: "Receive", detail: "Accept the request from WhatsApp, voice, web or an existing inbox." },
      { label: "Understand", detail: `Collect ${context.record} using approved questions.` },
      { label: "Act", detail: `${context.action.charAt(0).toUpperCase()}${context.action.slice(1)}.${toolDetail}` },
      { label: "Review", detail: reviewDetail },
    ],
  };
}

export function TypewriterText({ text }: { text: string }) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setVisible(text));
      return () => cancelAnimationFrame(frame);
    }

    let position = 0;
    let timer = 0;
    const startDelay = window.setTimeout(() => {
      timer = window.setInterval(() => {
        position += 1;
        setVisible(text.slice(0, position));
        if (position >= text.length) window.clearInterval(timer);
      }, 58);
    }, 260);
    return () => {
      window.clearTimeout(startDelay);
      window.clearInterval(timer);
    };
  }, [text]);

  return <><span className="sr-only">{text}</span><em className="typewriter-line" aria-hidden="true">{visible}<i/></em></>;
}

export function WorkflowPrompt() {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const closeButton = useRef<HTMLButtonElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking]);

  function send(event?: FormEvent) {
    event?.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || thinking) return;
    setOpen(true);
    setThinking(true);
    setMessages((current) => [...current, { role: "user", text: cleanPrompt }]);
    setPrompt("");
    window.setTimeout(() => {
      setMessages((current) => [...current, {
        role: "assistant",
        text: "I mapped the request into a practical first workflow. The steps below are illustrative and can be refined around your tools, policies and team.",
        blueprint: createBlueprint(cleanPrompt),
      }]);
      setThinking(false);
    }, 650);
  }

  function submitOnEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return <>
    <section className="workflow-playground" aria-labelledby="workflow-playground-title">
      <div className="prompt-intro">
        <span><Sparkle weight="fill"/> INTERACTIVE WORKFLOW PREVIEW</span>
        <b id="workflow-playground-title">Describe one task your team repeats.</b>
        <p>Try a real process. This preview maps the request locally in your browser—nothing is sent or stored.</p>
      </div>
      <div className="prompt-gradient-frame">
        <form className="prompt-composer" onSubmit={send}>
          <label className="sr-only" htmlFor="workflow-prompt">Describe a workflow to map</label>
          <textarea id="workflow-prompt" value={prompt} maxLength={600} rows={3} onChange={(event) => setPrompt(event.target.value)} onKeyDown={submitOnEnter} placeholder="Example: We receive admission enquiries on WhatsApp and need to answer questions, collect details and schedule campus visits."/>
          <div className="prompt-toolbar"><span><ShieldCheck/> No sensitive customer data</span><button type="submit" disabled={!prompt.trim() || thinking} aria-label="Map this workflow"><PaperPlaneTilt weight="fill"/></button></div>
        </form>
      </div>
      <div className="prompt-starters" aria-label="Example workflows">{starters.map((starter) => <button type="button" key={starter} onClick={() => setPrompt(starter)}>{starter}<ArrowRight/></button>)}</div>
    </section>

    {open && createPortal(<div className="workflow-sheet-layer">
      <button className="workflow-sheet-dismiss" type="button" onClick={() => setOpen(false)} aria-label="Close workflow preview"/>
      <aside className="workflow-sheet" role="dialog" aria-modal="true" aria-labelledby="workflow-result-title">
        <header><span><CirclesFour weight="duotone"/><b id="workflow-result-title">Workflow Studio</b><small>Interactive preview</small></span><button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Close workflow preview"><X/></button></header>
        <div className="workflow-chat" aria-live="polite">
          <div className="chat-message assistant-message"><span><Sparkle weight="fill"/></span><div><small>Workflow guide</small><p>Tell me what repeats, where it slows down and what should remain with a person.</p></div></div>
          {messages.map((message, index) => <div className={`chat-message ${message.role}-message`} key={`${message.role}-${index}`}>
            <span>{message.role === "assistant" ? <Sparkle weight="fill"/> : <User weight="fill"/>}</span>
            <div><small>{message.role === "assistant" ? "Workflow guide" : "You"}</small><p>{message.text}</p>{message.blueprint && <div className="workflow-result-card"><span><CheckCircle weight="fill"/> WORKFLOW MAPPED</span><h3>{message.blueprint.title}</h3><p>{message.blueprint.summary}</p><ol>{message.blueprint.steps.map((step) => <li key={step.label}><b>{step.label}</b><span>{step.detail}</span></li>)}</ol><footer><ShieldCheck/> Human approval and exception handling stay visible.</footer></div>}</div>
          </div>)}
          {thinking && <div className="chat-message assistant-message"><span><Sparkle weight="fill"/></span><div><small>Mapping your workflow</small><div className="typing-dots" aria-label="Generating workflow preview"><i/><i/><i/></div></div></div>}
          <div ref={chatEnd}/>
        </div>
        <form className="sheet-composer" onSubmit={send}><label className="sr-only" htmlFor="workflow-follow-up">Refine the workflow</label><textarea id="workflow-follow-up" value={prompt} rows={2} onChange={(event) => setPrompt(event.target.value)} onKeyDown={submitOnEnter} placeholder="Add a tool, rule or human checkpoint…"/><button type="submit" disabled={!prompt.trim() || thinking} aria-label="Send follow-up"><PaperPlaneTilt weight="fill"/></button></form>
      </aside>
    </div>, document.body)}
  </>;
}
