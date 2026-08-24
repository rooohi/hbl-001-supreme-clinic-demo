import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, BookOpenText, CalendarCheck, CheckCircle, CirclesFour, EnvelopeSimple, Globe, MapPin, Microphone, Pulse, ShieldCheck, Sparkle, Translate, UserFocus, UsersThree, WhatsappLogo, Wrench } from "@phosphor-icons/react/dist/ssr";
import { AnimatedMetrics } from "@/components/animated-metrics";
import { IndustrySelector } from "@/components/industry-selector";
import { CTA, Footer, Header } from "@/components/site-shell";

const agents = [
  {label:"SALES",title:"AI Sales Agent",copy:"Understands interest, qualifies the opportunity and keeps the next action moving.",boundary:"Commercial decisions follow your rules.",href:"/ai-employees/sales-agent",image:"/hbl-001-supreme-clinic-demo/assets/torvent-v2/role-sales.webp"},
  {label:"FRONT DESK",title:"AI Receptionist",copy:"Handles multilingual enquiries, gathers context and coordinates permitted bookings.",boundary:"Uncertain requests move to human review.",href:"/ai-employees/receptionist",image:"/hbl-001-supreme-clinic-demo/assets/torvent-v2/role-reception.webp"},
  {label:"ADMISSIONS",title:"AI Admission Officer",copy:"Guides families from first question to a complete, usable admission record.",boundary:"Eligibility exceptions remain with the team.",href:"/ai-employees/admission-officer",image:"/hbl-001-supreme-clinic-demo/assets/torvent-v2/role-admissions.webp"},
  {label:"SUPPORT",title:"AI Support Agent",copy:"Resolves repeat requests from approved knowledge and structures every escalation.",boundary:"Low-confidence cases never disappear.",href:"/ai-employees/support-agent",image:"/hbl-001-supreme-clinic-demo/assets/torvent-v2/role-support.webp"},
] as const;

export default function Home(){return <><Header/><main>
  <section className="v2-hero" id="top">
    <Image className="v2-hero-image" src="/hbl-001-supreme-clinic-demo/assets/torvent-v2/hero-field.webp" alt="" fill priority sizes="100vw"/>
    <div className="v2-hero-shade" aria-hidden="true"/>
    <div className="container v2-hero-inner">
      <div className="v2-hero-badge"><ShieldCheck weight="duotone"/> Responsible AI. Real work.</div>
      <h1>AI that works for your business.</h1>
      <p>TORVENT designs AI roles that understand requests, use approved knowledge, take permitted actions and bring in your team when judgment matters.</p>
      <Link className="v2-hero-cta" href="/contact">Show Us Your Workflow <ArrowRight/></Link>
      <div className="v2-hero-languages"><span lang="kn">ಕನ್ನಡ</span><i/>English<i/><span lang="hi">हिंदी</span></div>
    </div>
    <a className="v2-scroll-cue" href="#operating-model" aria-label="Continue to operating model"><span>Explore TORVENT</span><ArrowDown/></a>
  </section>

  <section className="v2-premise" id="operating-model"><div className="container v2-premise-grid">
    <div><p className="section-kicker">THE OPERATING MODEL</p><h2>From request to accountable action.</h2></div>
    <div className="v2-premise-copy"><p>TORVENT is built for complete workflows—not isolated answers. Every role has defined knowledge, permissions, actions and an escalation path.</p><div className="v2-principles">{[[BookOpenText,"Approved knowledge"],[ShieldCheck,"Permitted actions"],[UsersThree,"Human review"],[Pulse,"Visible history"]].map(([Icon,label])=><span key={String(label)}><Icon weight="duotone"/>{String(label)}</span>)}</div></div>
  </div></section>

  <section className="v2-roles" id="solutions"><div className="container">
    <div className="v2-section-heading"><div><p className="section-kicker">AI ROLES</p><h2>One role. Clear responsibility.</h2></div><p>Each role owns a defined part of the work, stays within policy and makes exceptions visible to the accountable team.</p></div>
    <div className="v2-role-grid">{agents.map(agent=><Link href={agent.href} className="v2-role-card" key={agent.title}><div className="v2-role-visual"><Image src={agent.image} alt="" fill sizes="(max-width: 760px) 100vw, 50vw"/></div><div className="v2-role-content"><small>{agent.label}</small><h3>{agent.title}</h3><p>{agent.copy}</p><span><ShieldCheck weight="duotone"/>{agent.boundary}</span><b>View role <ArrowRight/></b></div></Link>)}</div>
  </div></section>

  <section className="v2-architecture" id="how-torvent-works"><div className="container">
    <div className="v2-section-heading v2-heading-light"><div><p className="section-kicker">HOW TORVENT WORKS</p><h2>One connected path through your business.</h2></div><p>The agent connects conversation, knowledge and action while review and observability stay part of the same operating path.</p></div>
    <div className="v2-architecture-map" aria-label="TORVENT operational AI architecture">
      <div className="v2-arch-column v2-arch-channels"><small>01 · CUSTOMER & CHANNELS</small><div><span><WhatsappLogo/>WhatsApp</span><span><Microphone/>Voice</span><span><Globe/>Web</span><span><EnvelopeSimple/>Email</span></div></div>
      <ArrowRight className="v2-arch-arrow"/>
      <div className="v2-arch-column"><small>02 · UNDERSTANDING</small><b><Sparkle weight="duotone"/> Intent · Context · Entities</b><p>The request becomes structured and usable.</p></div>
      <ArrowRight className="v2-arch-arrow"/>
      <div className="v2-arch-core"><span>TORVENT AGENT</span><b>Knowledge & policy</b><p>Approved sources · rules · permissions</p><i><CirclesFour/> Orchestration</i></div>
      <ArrowRight className="v2-arch-arrow"/>
      <div className="v2-arch-column"><small>03 · TOOLS & ACTIONS</small><b><Wrench weight="duotone"/> CRM · Calendar · ERP</b><p>Permitted updates, bookings and messages.</p></div>
      <ArrowRight className="v2-arch-arrow"/>
      <div className="v2-arch-column"><small>04 · OUTCOME</small><b><CheckCircle weight="duotone"/> Work moves forward</b><p>Result, handoff and next step stay visible.</p></div>
      <div className="v2-human-branch"><UserFocus weight="duotone"/><span><small>HUMAN REVIEW</small><b>Exceptions return with context</b></span></div>
      <div className="v2-audit-rail"><Pulse weight="duotone"/><span><small>AUDIT & OBSERVABILITY</small><b>Requests · decisions · actions · outcomes</b></span></div>
    </div>
  </div></section>

  <section className="language-section v2-language"><div className="container language-grid"><div><p className="section-kicker blue-kicker">LANGUAGE INTELLIGENCE</p><h2>Built for how India actually speaks.</h2><p>People change language mid-sentence. TORVENT follows the meaning, preserves the context and keeps the next action clear.</p><Link href="/ai-voice-agents" className="text-link">Explore voice AI <ArrowRight/></Link></div><div className="conversation-stack"><div><small><span lang="kn">ಕನ್ನಡ</span> + English</small><span lang="kn">“ಅಡ್ಮಿಷನ್ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?”</span></div><div><small>English</small>“Can I book a campus visit tomorrow?”</div><div><small>Mixed language</small><span>“Fees details WhatsApp <span lang="kn">ಮಾಡಿ</span>.”</span></div><p><Translate weight="fill"/> ಕನ್ನಡ · English · हिंदी with human review</p></div></div></section>

  <section className="home-section measure-section v2-measures"><div className="container measure-grid"><div><p className="section-kicker">OPERATIONAL MEASURES</p><h2>Measure the work. Not the hype.</h2><p>Every pilot starts with a baseline and a small set of useful measures. This sample view shows the operating signals we can design—not achieved customer results.</p><div className="v2-measure-tags"><span>Response time</span><span>Completion rate</span><span>Escalation quality</span><span>Action success</span></div></div><AnimatedMetrics/></div></section>

  <section className="v2-industries" id="industries"><div className="container"><div className="v2-section-heading"><div><p className="section-kicker">INDUSTRY WORKFLOWS</p><h2>Context changes everything.</h2></div><p>The same model should not behave the same way in a college, healthcare setting or factory. Explore how the operating path changes.</p></div><IndustrySelector/></div></section>

  <section className="v2-trajectory" id="about"><div className="container"><p className="section-kicker">BUILT IN HUBBALLI · DESIGNED FOR GLOBAL SCALE</p><h2>Close to real work. Ready to travel.</h2><p>TORVENT starts from the operating realities of growing Indian teams and builds systems that can extend across locations, languages and markets.</p><ol>{[[MapPin,"Hubballi","Close to the workflow"],[CirclesFour,"Karnataka","Prove repeatable patterns"],[Translate,"India","Support multilingual operations"],[Globe,"Global Scale","Adapt with the same discipline"]].map(([Icon,place,copy],index)=><li key={String(place)}><span>0{index+1}</span><Icon weight="duotone"/><b>{String(place)}</b><small>{String(copy)}</small></li>)}</ol></div></section>

  <section className="v2-boundaries"><div className="container"><div className="v2-section-heading"><div><p className="section-kicker">BUILT FOR ACCOUNTABILITY</p><h2>AI with clear boundaries.</h2></div><p>Useful automation starts with explicit rules for what the system knows, what it may do and when the accountable team must take over.</p></div><div className="v2-boundary-rail">{[[BookOpenText,"Knowledge","Approved sources"],[ShieldCheck,"Permissions","Role-based access"],[CalendarCheck,"Actions","Permitted steps"],[UsersThree,"Escalation","Human review"],[Pulse,"History","Reviewable activity"]].map(([Icon,title,copy],index)=><article key={String(title)}><span>0{index+1}</span><Icon weight="duotone"/><h3>{String(title)}</h3><p>{String(copy)}</p></article>)}</div></div></section>
  <CTA/>
  </main><Footer/></>}
