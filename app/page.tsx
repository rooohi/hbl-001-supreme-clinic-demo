import Link from "next/link";
import { ArrowRight, Buildings, CalendarCheck, ChartLineUp, CheckCircle, ChatsCircle, CirclesFour, Factory, GraduationCap, Handshake, Headset, Heartbeat, MapPin, PhoneCall, Pulse, ShieldCheck, Sparkle, Storefront, Translate, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { AnimatedMetrics } from "@/components/animated-metrics";
import { CTA, Footer, Header } from "@/components/site-shell";
import { TypewriterText } from "@/components/workflow-prompt";

const agents = [
  { icon: ChartLineUp, title: "Sales", role: "AI Sales Agent", copy: "Qualifies interest and keeps every good lead moving.", href: "/ai-employees/sales-agent", tone: "sage" },
  { icon: PhoneCall, title: "Front desk", role: "AI Receptionist", copy: "Answers, schedules and hands over with context.", href: "/ai-employees/receptionist", tone: "blue" },
  { icon: GraduationCap, title: "Admissions", role: "AI Admission Officer", copy: "Guides families from first question to campus visit.", href: "/ai-employees/admission-officer", tone: "sand" },
  { icon: Headset, title: "Support", role: "AI Support Agent", copy: "Resolves repeat requests and structures escalations.", href: "/ai-employees/support-agent", tone: "grey" },
];

const industries = [
  { icon: GraduationCap, title: "Education", copy: "Admissions without missed enquiries", href: "/industries/education" },
  { icon: Heartbeat, title: "Healthcare", copy: "Access and administration, never diagnosis", href: "/industries/healthcare" },
  { icon: Buildings, title: "Real Estate", copy: "Qualified interest to scheduled visits", href: "/industries/real-estate" },
  { icon: Factory, title: "Manufacturing", copy: "Faster RFQ and service coordination", href: "/industries/manufacturing" },
  { icon: Storefront, title: "Services", copy: "Bookings, reminders and follow-through", href: "/industries/service-businesses" },
];

export default function Home() { return <><Header/><main>
  <section className="cinematic-hero" id="top">
    <div className="cinematic-bg" aria-hidden="true"><video className="cinematic-video" autoPlay muted loop playsInline preload="metadata"><source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4" type="video/mp4"/></video><div className="cinematic-veil"/><div className="cinematic-grain"/></div>
    <div className="container cinematic-hero-layout">
      <div className="cinematic-hero-copy">
        <div className="cinematic-trust hero-anim" style={{"--hero-delay":".05s"} as React.CSSProperties}>
          <div className="cinematic-trust-rings" aria-hidden="true"><span><ShieldCheck weight="duotone"/></span><span><Translate weight="duotone"/></span><span><UsersThree weight="duotone"/></span></div>
          <p>Responsible AI, built around real work</p>
        </div>
        <h1 className="cinematic-headline"><span>Turn customer requests</span><TypewriterText text="into finished work."/></h1>
        <p className="cinematic-lede hero-anim" style={{"--hero-delay":".3s"} as React.CSSProperties}>AI agents that answer, collect the right details, update your systems and bring people in when judgment matters.</p>
        <Link className="cinematic-cta hero-anim" style={{"--hero-delay":".42s"} as React.CSSProperties} href="/contact">Show us one workflow <ArrowRight/></Link>
        <div className="hero-assurance hero-anim" style={{"--hero-delay":".52s"} as React.CSSProperties}><span><ShieldCheck weight="fill"/> Local preview</span><span><UsersThree weight="fill"/> Human handoff</span><span><Translate weight="fill"/> ಕನ್ನಡ · English · हिंदी</span></div>
      </div>
    </div>
  </section>

  <section className="trust-strip"><div className="container">{[[ShieldCheck,"One workflow at a time","A clear owner and measurable outcome"],[CirclesFour,"Connects to existing tools","CRM, calendar, ERP, inbox and approved data"],[Translate,"ಕನ್ನಡ · English · हिंदी","Natural mixed-language conversations"],[Pulse,"Human review built in","Approvals, escalation and reviewable activity"]].map(([Icon,title,copy])=><div key={String(title)}><Icon weight="duotone"/><span><b>{String(title)}</b><small>{String(copy)}</small></span></div>)}</div></section>

  <section className="home-section employees-section" id="solutions"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">AI ROLES</p><h2>One role. Clear responsibility.</h2><p>Each role owns a defined set of tasks, works from approved information and sends exceptions to a named person.</p></div><div className="agent-grid">{agents.map(({icon:Icon,title,role,copy,href,tone})=><Link href={href} className={`agent-card ${tone}`} key={role}><div><Icon weight="duotone"/><span>{title}</span></div><h3>{role}</h3><p>{copy}</p><b>View role <ArrowRight/></b></Link>)}</div></div></section>

  <section className="architecture-section"><div className="container architecture-intro"><p className="section-kicker">HOW THE WORK MOVES</p><h2>From first message<br/>to completed next step.</h2><p>The system understands the request, uses approved context, takes a permitted action and records the outcome for your team.</p></div><div className="container architecture-stage"><div className="architecture-rail" aria-label="Connected AI workflow architecture">
    <article><span><ChatsCircle/></span><small>01 · RECEIVE</small><b>A request arrives</b><p>Voice, WhatsApp, web, email or an internal queue.</p></article>
    <article><span><Sparkle/></span><small>02 · UNDERSTAND</small><b>Context is applied</b><p>Approved knowledge, policy and the customer’s details.</p></article>
    <article><span><CalendarCheck/></span><small>03 · ACT</small><b>A permitted step happens</b><p>Book, update, route, notify or prepare for approval.</p></article>
    <article><span><CheckCircle/></span><small>04 · RECORD</small><b>The outcome stays visible</b><p>Actions, handoffs and exceptions remain reviewable.</p></article>
  </div><div className="architecture-guard"><ShieldCheck weight="duotone"/><b>Control runs through every stage</b><span>Permissions</span><span>Thresholds</span><span>Approval</span><span>Escalation</span></div></div></section>

  <section className="language-section"><div className="container language-grid"><div><p className="section-kicker blue-kicker">LANGUAGE INTELLIGENCE</p><h2>Built for how <span className="india-word">INDIA</span> actually speaks.</h2><p>People change language mid-sentence. The system should follow the meaning and keep the workflow clear.</p><Link href="/ai-voice-agents" className="text-link">Explore voice AI <ArrowRight/></Link></div><div className="conversation-stack"><div><small><span lang="kn">ಕನ್ನಡ</span> + English</small><span lang="kn">“ಅಡ್ಮಿಷನ್ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?”</span></div><div><small>English</small>“Can I book a campus visit tomorrow?”</div><div><small>Mixed language</small><span>“Fees details WhatsApp <span lang="kn">ಮಾಡಿ</span>.”</span></div><p><CheckCircle weight="fill"/> Regional language workflows with human review</p></div></div></section>

  <section className="home-section measure-section"><div className="container measure-grid"><div><p className="section-kicker">OPERATIONAL PROOF</p><h2>See the work.<br/>Not the hype.</h2><p>Every pilot starts with a baseline and a small set of useful measures. The illustration shows the kind of operating view we design—not claimed customer results.</p><Link className="text-link" href="/case-studies">How evidence is reported <ArrowRight/></Link></div><AnimatedMetrics/></div></section>

  <section className="home-section process-section"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">FROM PILOT TO PRODUCTION</p><h2>A careful path to useful AI.</h2></div><div className="process-track process-four">{[["01","Map","One workflow, its people, systems and risks."],["02","Prototype","A controlled version using approved knowledge."],["03","Integrate","Real tools, permissions and human handoffs."],["04","Improve","Measure, review and expand only when proven."]].map(([n,title,copy])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

  <section className="home-section industries-section" id="industries"><div className="container"><div className="editorial-heading row-heading"><div><p className="section-kicker">INDUSTRY WORKFLOWS</p><h2>Context changes<br/>everything.</h2></div><p>The same model should not behave the same way in a college, clinic or factory. We design around the decisions each team owns.</p></div><div className="industry-list">{industries.map(({icon:Icon,title,copy,href},i)=><Link href={href} key={title}><span>0{i+1}</span><Icon/><b>{title}</b><small>{copy}</small><ArrowRight/></Link>)}</div></div></section>

  <section className="vision-section" id="about"><div className="container vision-grid"><div><p className="section-kicker mint">BUILT IN HUBBALLI · DESIGNED TO SCALE</p><h2>Close to the work.<br/>Ready for wider operations.</h2><p>Hubballi gives us proximity to growing businesses, real operating constraints and multilingual customers. Every implementation is designed so the same discipline can extend across Karnataka, India and international teams.</p><Link className="text-link light-link" href="/locations/hubli">Why Hubballi matters <ArrowRight/></Link></div><div className="vision-board"><header><span>GROWTH DIRECTION</span><em>Built step by step</em></header>{[[MapPin,"ORIGIN","Hubballi","Co-design with local operating teams"],[Handshake,"REGIONAL PATTERN","Karnataka","Repeat proven workflows across branches"],[Buildings,"NATIONAL SCALE","INDIA","Support multilingual, multi-location operations"],[Sparkle,"GLOBAL READINESS","Beyond India","Adapt proven systems to new markets"]].map(([Icon,phase,place,copy],i)=><article className={`vision-place-${String(place).toLowerCase().replace(" ","-")}`} style={{"--vision-step":i} as React.CSSProperties} key={String(phase)}><Icon weight="duotone"/><span><small>{String(phase)}</small><b>{place==="INDIA"?<span className="india-word">INDIA</span>:String(place)}</b><p>{String(copy)}</p></span></article>)}</div></div></section>

  <section className="home-section trust-section"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">BUILT FOR ACCOUNTABILITY</p><h2>Clear boundaries. Visible actions. Human ownership.</h2><p>Before launch, we define what the system can access, which actions it may take, when it must stop and who reviews exceptions.</p></div><div className="trust-card-grid">{[[ShieldCheck,"Approved knowledge","Answers come from information your team owns and reviews."],[CirclesFour,"Role-based permissions","The system accesses only the tools and actions required for its job."],[UsersThree,"Human escalation","Sensitive, uncertain and exceptional cases move to a named owner."],[Pulse,"Reviewable history","Conversations, actions, handoffs and failures remain visible for improvement."]].map(([Icon,title,copy])=><article key={String(title)}><Icon weight="duotone"/><h3>{String(title)}</h3><p>{String(copy)}</p></article>)}</div></div></section>
  <CTA/>
  </main><Footer/></> }
