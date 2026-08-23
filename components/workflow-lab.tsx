"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarCheck,
  ChartLineUp,
  CheckCircle,
  GraduationCap,
  Sparkle,
  WhatsappLogo,
} from "@phosphor-icons/react";

const demos = {
  Admissions: {
    icon: GraduationCap,
    eyebrow: "Admissions",
    incoming: "BCA admission fees eshtu?",
    language: "ಕನ್ನಡ + English",
    intent: "Understood the course enquiry",
    answer: "Shared approved fee details",
    action: "Offered a campus visit",
    system: "Updated the admissions CRM",
    result: "Campus visit offered",
  },
  Sales: {
    icon: ChartLineUp,
    eyebrow: "Sales",
    incoming: "We need automation for our 3 branches.",
    language: "English",
    intent: "Recognised a multi-location lead",
    answer: "Asked the right discovery questions",
    action: "Booked a consultation",
    system: "Updated the sales pipeline",
    result: "Lead qualified",
  },
  Reception: {
    icon: CalendarCheck,
    eyebrow: "Front desk",
    incoming: "Tomorrow 4 pm appointment sigutta?",
    language: "ಕನ್ನಡ + English",
    intent: "Understood the appointment request",
    answer: "Checked live availability",
    action: "Held the requested slot",
    system: "Updated the team calendar",
    result: "Appointment booked",
  },
} as const;

type DemoKey = keyof typeof demos;

export function WorkflowLab() {
  const [active, setActive] = useState<DemoKey>("Admissions");
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const demo = demos[active];

  useEffect(() => {
    const timers = [1, 2, 3, 4].map((next, index) =>
      window.setTimeout(() => setPhase(next), 520 + index * 620),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [active, run]);

  function choose(next: DemoKey) {
    setPhase(0);
    if (next === active) setRun((value) => value + 1);
    else setActive(next);
  }

  function replay() {
    setPhase(0);
    setRun((value) => value + 1);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const keys = Object.keys(demos) as DemoKey[];
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? keys.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length;
    choose(keys[nextIndex]);
    tabs.current[nextIndex]?.focus();
  }

  const stages = [
    ["UNDERSTAND", demo.intent],
    ["ANSWER", demo.answer],
    ["ACT", demo.action],
    ["UPDATE", demo.system],
  ];

  return <div className="lab-shell" id="workflow-lab">
    <div className="lab-toolbar">
      <span><i/><i/><i/></span>
      <b>LIVE WORKFLOW</b>
      <button type="button" onClick={replay} aria-label="Replay workflow"><ArrowClockwise/> Replay</button>
    </div>

    <div className="lab-role-picker">
      <p>Choose a role</p>
      <div className="lab-tabs" role="tablist" aria-label="Choose an AI employee">
        {(Object.keys(demos) as DemoKey[]).map((label, index) => {
          const Icon = demos[label].icon;
          return <button
            ref={(node) => { tabs.current[index] = node; }}
            id={`role-${label.toLowerCase()}`}
            type="button"
            role="tab"
            aria-controls="workflow-panel"
            aria-selected={active === label}
            tabIndex={active === label ? 0 : -1}
            className={active === label ? "active" : ""}
            onClick={() => choose(label)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            key={label}
          ><Icon weight="duotone"/><span>{demos[label].eyebrow}</span></button>;
        })}
      </div>
    </div>

    <div
      className="lab-canvas"
      id="workflow-panel"
      role="tabpanel"
      aria-labelledby={`role-${active.toLowerCase()}`}
      aria-live="polite"
    >
      <div className="lab-message" key={`${active}-${run}-message`}>
        <div><WhatsappLogo weight="fill"/><small>CUSTOMER · WHATSAPP</small></div>
        <p>“{demo.incoming}”</p>
        <span>{demo.language}</span>
      </div>

      <div className="lab-route" aria-label="AI workflow progress">
        {stages.map(([label, stageText], index) => {
          const visible = phase >= index + 1;
          return <div className={visible ? "route-step complete" : "route-step"} key={`${active}-${label}`}>
            <span>{visible ? <CheckCircle weight="fill"/> : index + 1}</span>
            <div><small>{label}</small><p>{stageText}</p></div>
          </div>;
        })}
      </div>

      <div className={phase >= 4 ? "lab-outcome visible" : "lab-outcome"}>
        <span><Sparkle weight="fill"/></span>
        <div><small>WORKFLOW COMPLETE</small><b>{demo.result}</b><p>Human handoff stays available whenever judgment is needed.</p></div>
        <Link href="/contact">Show us yours <ArrowRight/></Link>
      </div>
    </div>
  </div>;
}
