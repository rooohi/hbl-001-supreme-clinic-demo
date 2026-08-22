import { ArrowRight, CheckCircle, Globe, Sparkle } from "@phosphor-icons/react/dist/ssr";

const brand = "{{BRAND_NAME}}";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav-inner">
          <a className="wordmark" href="#top" aria-label={`${brand} home`}>
            <span className="brand-glyph">A</span>{brand}
          </a>
          <nav aria-label="Primary navigation">
            <a href="#solutions">Solutions</a>
            <a href="#employees">AI Employees</a>
            <a href="#industries">Industries</a>
            <a href="#about">About</a>
          </nav>
          <a className="button button-small" href="/contact">Show Us Your Workflow <ArrowRight /></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-orb" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span /> AI AUTOMATION · HUBBALLI, INDIA</p>
            <h1>AI that works<br />for your business.</h1>
            <p className="hero-lede">Build AI employees that answer, qualify, follow up, book and automate repetitive work — 24/7.</p>
            <div className="hero-actions">
              <a className="button" href="#demo"><Sparkle weight="fill" /> See AI in Action</a>
              <a className="text-link" href="/contact">Show Us Your Workflow <ArrowRight /></a>
            </div>
            <div className="language-row"><Globe /> Kannada <span>·</span> English <span>·</span> Hindi</div>
          </div>

          <div className="workflow-card" id="demo" aria-label="Example AI admission workflow">
            <div className="demo-topbar">
              <div><i /><i /><i /></div>
              <span>AI ADMISSION OFFICER</span>
              <b>LIVE</b>
            </div>
            <div className="demo-body">
              <p className="demo-label">INCOMING MESSAGE</p>
              <div className="message">“BCA admission fees eshtu?”<small>WhatsApp · just now</small></div>
              <div className="flow-line" />
              <div className="flow-step"><CheckCircle weight="fill" /><span><small>INTENT UNDERSTOOD</small>Admission enquiry · Kannada + English</span></div>
              <div className="flow-step"><CheckCircle weight="fill" /><span><small>ACTION COMPLETED</small>Fee details shared. Lead captured.</span></div>
              <div className="flow-step active"><Sparkle weight="fill" /><span><small>NEXT ACTION</small>Campus visit slots offered</span><em>CRM updated</em></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band">
        <div className="container"><p>BUILT FOR</p><span>Education</span><i /> <span>Healthcare</span><i /> <span>Real Estate</span><i /> <span>Manufacturing</span><i /> <span>Service Businesses</span></div>
      </section>
    </main>
  );
}
