import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Buildings, CalendarCheck, ChartLineUp, CheckCircle, ChatsCircle, CirclesFour, Factory, GraduationCap, Handshake, Headset, Heartbeat, MapPin, PhoneCall, Pulse, ShieldCheck, Sparkle, Storefront, Translate, UsersThree, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { AnimatedMetrics } from "@/components/animated-metrics";
import { CTA, Footer, Header } from "@/components/site-shell";

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
  <section className="center-hero" id="top"><div className="hero-wash wash-green"/><div className="hero-wash wash-blue"/><div className="container center-hero-inner">
    <p className="eyebrow hero-eyebrow"><span/> RESPONSIBLE AI SYSTEMS · BUILT IN HUBBALLI</p>
    <h1>AI that carries<br/><em>real work forward.</em></h1>
    <p className="hero-lede">We design AI agents and connected workflows that help teams respond faster, act consistently and stay in control.</p>
    <div className="center-hero-actions"><Link className="button" href="/contact">Plan a focused pilot <ArrowRight/></Link><Link className="text-link" href="/ai-agents">Explore what we build <ArrowRight/></Link></div>
    <div className="abstract-system"><Image src="/hbl-001-supreme-clinic-demo/ai-system-abstract.png" alt="Abstract connected intelligence system with calm glass nodes and flowing pathways" width={1536} height={1024} priority sizes="(max-width: 900px) 100vw, 1100px"/><div className="system-caption"><span><ShieldCheck/> Governed actions</span><span><CirclesFour/> Connected tools</span><span><UsersThree/> Human approval</span></div></div>
  </div></section>

  <section className="trust-strip"><div className="container">{[[ShieldCheck,"Human oversight","Approval where judgment matters"],[CirclesFour,"Works with your stack","CRM, calendar, ERP and inboxes"],[Translate,"ಕನ್ನಡ · English · हिंदी","Designed for natural conversations"],[Pulse,"Measured from day one","Response, resolution and business impact"]].map(([Icon,title,copy])=><div key={String(title)}><Icon weight="duotone"/><span><b>{String(title)}</b><small>{String(copy)}</small></span></div>)}</div></section>

  <section className="home-section employees-section" id="solutions"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">AI WORKFORCE</p><h2>One role. Clear responsibility.</h2><p>Each system is trained around a specific job, trusted knowledge and explicit limits.</p></div><div className="agent-grid">{agents.map(({icon:Icon,title,role,copy,href,tone})=><Link href={href} className={`agent-card ${tone}`} key={role}><div><Icon weight="duotone"/><span>{title}</span></div><h3>{role}</h3><p>{copy}</p><b>View role <ArrowRight/></b></Link>)}</div></div></section>

  <section className="architecture-section"><div className="container architecture-intro"><p className="section-kicker">THE OPERATING LAYER</p><h2>From customer signal<br/>to approved action.</h2><p>Not another inbox. A governed layer that listens, decides, acts and records what happened.</p></div><div className="container architecture-stage"><div className="architecture-rail" aria-label="Connected AI workflow architecture">
    <article><span><ChatsCircle/></span><small>01 · SIGNAL</small><b>Customer or team request</b><p>Voice, WhatsApp, web, email or internal request.</p></article>
    <article><span><Sparkle/></span><small>02 · REASON</small><b>AI understands the job</b><p>Uses approved knowledge, policy and context.</p></article>
    <article><span><CalendarCheck/></span><small>03 · ACT</small><b>Next step is completed</b><p>Book, update, route, notify or prepare.</p></article>
    <article><span><CheckCircle/></span><small>04 · RECORD</small><b>Outcome stays visible</b><p>Every handoff and action can be reviewed.</p></article>
  </div><div className="architecture-guard"><ShieldCheck weight="duotone"/><b>Control runs through every stage</b><span>Permissions</span><span>Confidence thresholds</span><span>Human approval</span><span>Audit trail</span></div></div></section>

  <section className="language-section"><div className="container language-grid"><div><p className="section-kicker blue-kicker">LANGUAGE INTELLIGENCE</p><h2>Built for how <span className="india-word">India</span> actually speaks.</h2><p>People change language mid-sentence. The system should follow the meaning and keep the workflow clear.</p><Link href="/ai-voice-agents" className="text-link">Explore voice AI <ArrowRight/></Link></div><div className="conversation-stack"><div><small>ಕನ್ನಡ + ENGLISH</small>“ಅಡ್ಮಿಷನ್ ಯಾವಾಗ ಶುರುವಾಗುತ್ತದೆ?”</div><div><small>ENGLISH</small>“Can I book a campus visit tomorrow?”</div><div><small>MIXED</small>“Fees details WhatsApp ಮಾಡಿ.”</div><p><CheckCircle weight="fill"/> Regional language workflows with human review</p></div></div></section>

  <section className="home-section measure-section"><div className="container measure-grid"><div><p className="section-kicker">OPERATIONAL PROOF</p><h2>See the work.<br/>Not the hype.</h2><p>Every pilot starts with a baseline and a small set of useful measures. The illustration shows the kind of operating view we design—not claimed customer results.</p><Link className="text-link" href="/case-studies">How evidence is reported <ArrowRight/></Link></div><AnimatedMetrics/></div></section>

  <section className="home-section process-section"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">FROM PILOT TO PRODUCTION</p><h2>A careful path to useful AI.</h2></div><div className="process-track process-four">{[["01","Map","One workflow, its people, systems and risks."],["02","Prototype","A controlled version using approved knowledge."],["03","Integrate","Real tools, permissions and human handoffs."],["04","Improve","Measure, review and expand only when proven."]].map(([n,title,copy])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

  <section className="home-section industries-section" id="industries"><div className="container"><div className="editorial-heading row-heading"><div><p className="section-kicker">INDUSTRY WORKFLOWS</p><h2>Context changes<br/>everything.</h2></div><p>The same model should not behave the same way in a college, clinic or factory. We design around the decisions each team owns.</p></div><div className="industry-list">{industries.map(({icon:Icon,title,copy,href},i)=><Link href={href} key={title}><span>0{i+1}</span><Icon/><b>{title}</b><small>{copy}</small><ArrowRight/></Link>)}</div></div></section>

  <section className="vision-section" id="about"><div className="container vision-grid"><div><p className="section-kicker mint">OUR STARTING POINT · OUR DIRECTION</p><h2>Local understanding.<br/>Production ambition.</h2><p>We start close to the work—alongside teams in Hubballi—and build systems with the discipline to serve organisations anywhere.</p><Link className="text-link light-link" href="/locations/hubli">Why Hubballi matters <ArrowRight/></Link></div><div className="vision-board"><header><span>GROWTH VISION</span><em>Built step by step</em></header><div className="vision-line"><i/></div>{[[MapPin,"NOW","Hubballi","Work beside local operators"],[Handshake,"NEXT","Karnataka","Build trusted regional patterns"],[Buildings,"SCALE","India","Serve multi-location teams"],[Sparkle,"HORIZON","Global","Export proven operating systems"]].map(([Icon,phase,place,copy],i)=><article style={{"--vision-step":i} as React.CSSProperties} key={String(phase)}><Icon weight="duotone"/><span><small>{String(phase)}</small><b>{place==="India"?<span className="india-word">India</span>:String(place)}</b><p>{String(copy)}</p></span></article>)}</div></div></section>

  <section className="home-section trust-section"><div className="container"><div className="editorial-heading center-heading"><p className="section-kicker">TRUST IS THE PRODUCT</p><h2>Built to earn confidence.</h2><p>Useful automation lasts when teams understand what it knows, what it can do and when a person takes over.</p></div><div className="trust-card-grid">{[[ShieldCheck,"Boundaries before launch","Knowledge, permissions and escalation rules are agreed first."],[UsersThree,"People stay accountable","Sensitive decisions remain with the people responsible for them."],[Pulse,"Visible performance","Actions, failures and handoffs are reviewed—not hidden."],[Handshake,"Improvement together","We stay involved after launch and refine with real operating evidence."]].map(([Icon,title,copy])=><article key={String(title)}><Icon weight="duotone"/><h3>{String(title)}</h3><p>{String(copy)}</p></article>)}</div></div></section>
  <CTA/>
  </main><Footer/></> }
