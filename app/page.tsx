"use client";
import { useState } from "react";

const treatments = [
  ["Hair fall consultation", "Scalp analysis + personalised care plan", "30 min", "HF"],
  ["Acne & scar care", "Doctor-led assessment for clearer skin", "30 min", "AC"],
  ["Laser hair reduction", "Comfort-first consultation and patch test", "45 min", "LR"],
  ["Skin rejuvenation", "A tailored glow and texture programme", "40 min", "SR"],
];
const slots = ["10:00 AM", "11:30 AM", "1:00 PM", "4:30 PM", "6:00 PM", "7:30 PM"];

export default function Home() {
  const [treatment, setTreatment] = useState(treatments[0][0]);
  const [slot, setSlot] = useState("11:30 AM");
  const [step, setStep] = useState<"choose"|"details"|"confirmed">("choose");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  function confirmVisit(){
    const appointment={id:`SUP-${Date.now().toString().slice(-5)}`,name:name||"Demo Guest",phone:phone||"Demo number",treatment,slot,date:"2026-08-22",status:"Confirmed"};
    localStorage.setItem("supreme-latest-appointment",JSON.stringify(appointment));
    setStep("confirmed");
  }
  return <main>
    <header className="nav shell">
      <a className="brand" href="#top"><span className="brand-mark">S</span><span><b>SUPREME</b><small>HAIR &amp; SKIN CARE</small></span></a>
      <nav><a href="#treatments">Treatments</a><a href="#approach">Our approach</a><a href="#contact">Contact</a></nav>
      <a className="nav-cta" href="#book">Book a visit <span>→</span></a>
    </header>
    <section className="hero shell" id="top">
      <div className="hero-copy">
        <p className="eyebrow"><span/> Dermatologist-led care in Hubballi</p>
        <h1>Feel confident<br/>in your <em>own skin.</em></h1>
        <p className="lead">Thoughtful hair and skin care, designed around you—not a template. Begin with a clear consultation and a plan you can trust.</p>
        <div className="hero-actions"><a className="primary" href="#book">Find my appointment <span>↗</span></a><a className="text-link" href="#treatments">Explore treatments ↓</a></div>
        <div className="trust-row"><div className="faces"><i>AS</i><i>NP</i><i>RK</i></div><div><strong>4.8 <span>★★★★★</span></strong><small>Trusted by 290+ local clients</small></div></div>
      </div>
      <div className="hero-art" aria-label="Abstract portrait representing healthy skin and hair"><div className="portrait"><div className="face"/><div className="hair"/><div className="leaf l1"/><div className="leaf l2"/></div><div className="floating-note"><span>✦</span><div><b>Care that begins with listening</b><small>Personal. Private. Unhurried.</small></div></div><p className="vertical">SCIENCE × CARE × CONFIDENCE</p></div>
    </section>
    <section className="booking-wrap" id="book"><div className="shell booking-grid">
      <div className="booking-intro"><p className="eyebrow light"><span/> Appointment concierge</p><h2>A calmer way to<br/>book your care.</h2><p>Choose what you need and see available times instantly. No waiting on calls, no back-and-forth.</p><div className="steps"><b>01</b><span>Choose a concern</span><b>02</b><span>Select a time</span><b>03</b><span>Confirm your visit</span></div></div>
      <div className="booking-card">{step==="confirmed" ? <div className="confirmation"><span>✓</span><p className="eyebrow">Visit requested</p><h3>You’re all set.</h3><p>Your demo appointment for <b>{treatment}</b> at <b>{slot}</b> is reserved. A WhatsApp confirmation would be sent next.</p><div className="confirmation-actions"><button onClick={()=>setStep("choose")}>Book another visit</button><a href="/dashboard">Open clinic dashboard →</a></div><small>Demo only — details remain on this device and are not sent to the clinic.</small></div> : step==="details" ? <div className="details-step">
        <button className="back" onClick={()=>setStep("choose")}>← Back</button><div className="card-head"><div><small>STEP 3 OF 3</small><h3>Confirm your visit</h3></div><span>Almost done</span></div>
        <div className="visit-summary"><span>{treatment}</span><b>Sat, 22 Aug · {slot}</b><small>Supreme Hair &amp; Skin Care, Hosur</small></div>
        <label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Demo Guest" /></label><label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="Use a demo number" /></label>
        <label className="consent"><input type="checkbox" defaultChecked/> Send appointment updates on WhatsApp</label><button className="confirm" onClick={confirmVisit}>Request appointment <span>→</span></button><p className="secure">Demo data stays in your browser only</p>
      </div> : <>
        <div className="card-head"><div><small>STEP 1 OF 3</small><h3>What can we help with?</h3></div><span>About 1 min</span></div>
        <div className="treatment-list" id="treatments">{treatments.map(item=><button key={item[0]} className={treatment===item[0]?"selected":""} onClick={()=>setTreatment(item[0])}><i>{item[3]}</i><span><b>{item[0]}</b><small>{item[1]}</small></span><em>{item[2]}</em></button>)}</div>
        <div className="slot-title"><h4>Available today</h4><small>Sat, 22 Aug</small></div><div className="slots">{slots.map(item=><button key={item} className={slot===item?"selected":""} onClick={()=>setSlot(item)}>{item}</button>)}</div>
        <button className="confirm" onClick={()=>setStep("details")}>Continue with {slot} <span>→</span></button><p className="secure">◉ Your information stays private and secure</p>
      </>}</div>
    </div></section>
    <section className="promise shell" id="approach"><p className="eyebrow"><span/> The Supreme difference</p><h2>Real care is never rushed.</h2><div><article><b>01</b><h3>We listen first</h3><p>Every plan begins with your story, concerns and goals.</p></article><article><b>02</b><h3>Clear next steps</h3><p>Understand your options before you decide on treatment.</p></article><article><b>03</b><h3>Care that continues</h3><p>Thoughtful follow-ups help keep your progress on track.</p></article></div></section>
    <footer id="contact"><div className="shell"><div className="brand inverse"><span className="brand-mark">S</span><span><b>SUPREME</b><small>HAIR &amp; SKIN CARE</small></span></div><p>Shop 55, Nirvana Tradewinds, Hosur, Hubballi</p><a href="tel:+918123654277">+91 81236 54277</a><small>Concept demo from public business information. Not an official clinic website.</small></div></footer>
  </main>;
}

