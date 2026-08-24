# TORVENT website audit

Date: 24 August 2026

Scope: production site, exported routes, shared shell, content model, contact conversion, responsive CSS, metadata, structured data, accessibility and delivery pipeline.

Evidence: live desktop captures in `torvent-site-audit/01-home-desktop.png` through `06-contact-desktop.png`, source review, rendered HTML, and static-export tests.

## Executive assessment

The current site has a credible foundation: restrained typography, a calm palette, unusually clear human-oversight language, real Kannada content, honest qualification of illustrative results, and a working contact-to-WhatsApp journey. The strongest section is the language-intelligence story because it connects TORVENT to a real Indian operating reality without resorting to stock imagery.

The site is not yet presenting TORVENT as one coherent, established company. The public brand name still resolves to “AI Automation Hubballi” in metadata, footer, About copy, legal copy, form messages and the CRM. The homepage and subpages also rely on repeated four-card grids, equal visual weights and long vertical runs, which makes the experience feel assembled from reusable blocks rather than directed as a premium narrative. Conversion language changes between “Show us one workflow,” “Request a workflow review,” and “Continue in WhatsApp.” Interior navigation omits a persistent primary CTA. These are system issues, so they should be fixed at the source rather than page by page.

## What is working

- **Visual:** calm off-white, sage, blue and graphite palette; large readable headings; generous spacing; the supplied TORVENT wordmark is used as an image and keeps its aspect ratio.
- **UX:** navigation categories broadly match user intent; every main service, AI role and industry has a dedicated route; contact expectations and business hours are visible.
- **Content:** language is plain and operational; healthcare avoids clinical claims; case-study content is explicitly labelled as illustrative; trust copy avoids invented certification.
- **Accessibility:** skip links, semantic headings, labelled form fields, error focus, visible human-handoff language and reduced-motion hooks already exist.
- **Technical:** Next.js static export, sitemap, robots, Open Graph metadata, JSON-LD, route tests, local CRM isolation and GitHub Pages deployment are in place.

## Priority findings

### 1. Brand migration is incomplete

- **Severity:** Critical
- **Category:** Brand / Content / SEO
- **Current problem:** The visible logo says TORVENT, while configuration, page titles, footer copyright, About copy, legal pages, WhatsApp message, CRM description and JSON-LD identify the company as “AI Automation Hubballi.”
- **Why it matters:** Search engines, prospects and shared screenshots receive two identities. That weakens memorability and raises a basic trust question at the moment TORVENT is asking users to share a workflow.
- **Recommended change:** Make TORVENT the single public brand in central company configuration and all generated metadata/copy. Keep Hubballi as provenance and local relevance, not as the company name. Avoid implying a registered legal entity until one is available.
- **Expected benefit:** One recognizable brand across search, social previews, pages, forms and follow-up messages.

### 2. The experience lacks a single conversion system

- **Severity:** Critical
- **Category:** UX / Conversion
- **Current problem:** Primary CTA labels vary across the hero, shared CTA, contact form and mobile navigation. Interior pages do not show the primary CTA in the desktop header.
- **Why it matters:** Repetition builds confidence only when the promise and destination stay consistent. Changing labels makes users re-interpret the action on every page.
- **Recommended change:** Use “Show Us Your Workflow” as the primary CTA everywhere and “See How It Works” as the secondary CTA where needed. The WhatsApp form-submit action can remain channel-specific, but its surrounding heading should connect it to the primary promise.
- **Expected benefit:** Higher recognition, lower decision effort and a clearer site-wide journey.

### 3. Repeated card grids create section fatigue

- **Severity:** High
- **Category:** Visual / Information architecture
- **Current problem:** AI roles, workflow architecture, trust, capabilities, delivery steps and outcomes repeatedly appear as equal four-column blocks. The AI Agents capture shows a particularly long sequence of similar modules.
- **Why it matters:** Equal-weight containers flatten hierarchy and make distinct ideas feel interchangeable. Users scan the shape instead of learning the story.
- **Recommended change:** Preserve cards only for genuinely comparable choices. Use an editorial featured-role composition, a connected workflow rail, compact proof bands, numbered journeys and asymmetric text/diagram layouts for the rest.
- **Expected benefit:** Stronger pacing, faster comprehension and a more authored premium feel.

### 4. Hero is clear but not yet cinematic or product-expressive

- **Severity:** High
- **Category:** Visual / Brand
- **Current problem:** The current light hero is calm and uncluttered, but it is visually empty and does not show TORVENT’s intelligence or connected-work concept. Its remote video adds an external dependency without contributing visible value in the captured state.
- **Why it matters:** The hero must establish the brand, category, operating outcome and emotional tone in seconds.
- **Recommended change:** Move to a dark graphite/green hero using the real TORVENT wordmark, restrained light fields and subtle motion. Keep one dominant proposition and one primary plus one secondary action. Remove the remote video dependency.
- **Expected benefit:** Better brand recall, faster category recognition and improved loading resilience.

### 5. The homepage has explanation but little usable product interaction

- **Severity:** High
- **Category:** UX / Credibility
- **Current problem:** Architecture and metrics are illustrative and static. A workflow prompt exists in the codebase but is not part of the current homepage.
- **Why it matters:** A small, clearly labelled interaction lets users understand the product model faster than another paragraph, without pretending to be a production AI service.
- **Recommended change:** Place a constrained interactive workflow preview immediately after the credibility strip, not inside the hero. Label it as a local demonstration and show request, context, action and human-review output.
- **Expected benefit:** More engagement and a concrete explanation of TORVENT’s value.

### 6. Evidence is honest but still thin

- **Severity:** High
- **Category:** Content / Trust
- **Current problem:** The site correctly states that no customer case studies are published, but generic “outcomes” language recurs across many pages and can feel like placeholder proof.
- **Why it matters:** Established-company trust comes from specificity of method when customer evidence is unavailable.
- **Recommended change:** Replace generic outcome repetition with clearly labelled operating measures, implementation checklists, representative workflow blueprints and an explicit evidence standard. Keep all sample numbers visibly illustrative.
- **Expected benefit:** Credibility without fabricated clients, metrics or testimonials.

### 7. Navigation differs too much between home and interior pages

- **Severity:** High
- **Category:** UX / Consistency
- **Current problem:** The homepage uses a four-link pill navigation while interior pages use four dropdown groups. “Insights” is nested under Company, and the header’s conversion action disappears on desktop interior pages.
- **Why it matters:** Users must relearn navigation after their first click.
- **Recommended change:** Use one shell everywhere: TORVENT logo, Solutions, AI Roles, Industries, Insights, Company and the primary CTA. Retain compact mobile disclosure groups.
- **Expected benefit:** Predictable wayfinding and stronger conversion availability.

### 8. Footer is too large and repeats the sitemap

- **Severity:** Medium
- **Category:** Information architecture / Visual
- **Current problem:** Contact, location and four full link columns produce a large dense footer after already-long pages. Copyright still uses the old brand.
- **Why it matters:** The ending feels administrative rather than decisive.
- **Recommended change:** Keep logo, one trust line, location/contact, three compact groups and legal links. Use TORVENT consistently.
- **Expected benefit:** Cleaner closure and easier scanning.

### 9. Typography and spacing need tighter responsive governance

- **Severity:** High
- **Category:** Responsive / Accessibility
- **Current problem:** Desktop headings are extremely large and several sections depend on four columns. Source CSS contains many one-off component rules accumulated through iterations.
- **Why it matters:** Without a smaller token set and deliberate breakpoints, type, whitespace and controls can become inconsistent on 320–430 px devices.
- **Recommended change:** Establish fluid type tokens with `clamp()`, a compact spacing scale, 44 px minimum interactive targets, safe wrapping for Kannada/mixed-language text, and mobile-first one/two-column fallbacks.
- **Expected benefit:** More stable mobile layouts and fewer page-specific overrides.

### 10. Accessibility is thoughtful but incomplete at system level

- **Severity:** High
- **Category:** Accessibility
- **Current problem:** Dropdown navigation uses `<details>` without a coordinated open/close model; focus containment is not provided for the custom homepage mobile sheet; decorative motion/video requires stronger reduced-motion and pause treatment; low-contrast muted copy appears in the footer and legal notes.
- **Why it matters:** Keyboard, low-vision and motion-sensitive users may encounter extra friction even though basic semantics are present.
- **Recommended change:** Use a consistent accessible mobile dialog or native disclosure pattern, preserve visible focus, close menus on route change and Escape, verify 4.5:1 body-text contrast, disable nonessential motion under `prefers-reduced-motion`, and keep all icon-only controls labelled.
- **Expected benefit:** Closer alignment with WCAG 2.2 AA and a more robust navigation experience.

### 11. SEO foundations exist, but metadata reflects the wrong identity and intent

- **Severity:** Critical
- **Category:** SEO
- **Current problem:** Titles and Organization schema inherit the old brand. Canonical and OG image paths should be validated against the GitHub Pages base path. Subpages derive from one broad content record, limiting intent-specific metadata depth.
- **Why it matters:** Search engines need one entity name and route-specific relevance.
- **Recommended change:** Set TORVENT globally, keep Hubballi/Karnataka/India in service descriptions and local pages, produce route-specific title/description data, validate canonicals and social images, and keep structured data limited to factual Organization/ProfessionalService details.
- **Expected benefit:** Clearer entity recognition and stronger non-brand search relevance.

### 12. Performance depends on an unnecessary remote hero asset

- **Severity:** High
- **Category:** Performance / Technical
- **Current problem:** The hero requests a CloudFront MP4 outside the repository. It cannot be cache/version-controlled with the site and may compete with the Largest Contentful Paint path.
- **Why it matters:** A decorative remote asset adds failure and bandwidth risk with little conversion value.
- **Recommended change:** Remove it; use lightweight CSS gradients and the optimized local wordmark. Keep motion transform/opacity-only, load below-fold interactivity lazily where practical, and retain static export.
- **Expected benefit:** More reliable first paint and fewer external runtime dependencies.

### 13. Contact conversion does not yet feed a real CRM

- **Severity:** High
- **Category:** Functional / Operations
- **Current problem:** Without `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`, the form only prepares a WhatsApp message. The existing CRM is device-local and receives no web leads automatically.
- **Why it matters:** The public journey works, but lead capture depends on the visitor completing a second step and on manual follow-up.
- **Recommended change:** Keep the honest WhatsApp fallback for launch, clearly label it, and later connect a secure server-side form endpoint to the chosen CRM. Do not expose secrets in a static bundle.
- **Expected benefit:** Fewer lost enquiries and a reliable lead record when infrastructure is available.

### 14. Legal pages are correctly provisional but need simpler prominence

- **Severity:** Medium
- **Category:** Trust / Content
- **Current problem:** Legal pages disclose missing entity and jurisdiction details, which is honest, but those caveats are repeated and can overwhelm the main service story.
- **Why it matters:** Visitors need accurate boundaries without interpreting provisional text as instability across unrelated pages.
- **Recommended change:** Keep concise website notices, link them from the footer, and reserve project-specific contract/data terms for engagement. Update the public brand while retaining the “pending” qualification.
- **Expected benefit:** Honest compliance posture with less narrative drag.

### 15. Code organization makes global consistency harder than necessary

- **Severity:** Medium
- **Category:** Technical / Maintainability
- **Current problem:** Route content, page templates, legal sections, editorial routes and most presentation logic live in one large catch-all file; CTA text and asset paths are duplicated.
- **Why it matters:** Small global changes become risky and regressions are easier to introduce.
- **Recommended change:** Centralize brand, navigation and CTA constants; add shared page-intro, workflow-rail, evidence and FAQ components; keep content data separate from rendering where feasible.
- **Expected benefit:** Faster consistent iteration and smaller regression surface.

## Route-by-route audit

| Route group | Current role | Main issue | Redesign action |
|---|---|---|---|
| `/` | Company overview and conversion | Strong copy but visually repetitive below hero; no interactive proof | Dark premium hero, unified header, workflow preview, asymmetric roles, compact trust/proof pacing |
| `/ai-agents` | Category solution | Long run of near-identical grids | Use outcome-led intro, one architecture visual, representative scenario and compact measures |
| `/ai-voice-agents` | Voice solution | Regional advantage is present but under-visualized | Make mixed-language interaction the primary product story; keep human transfer explicit |
| `/whatsapp-ai-automation` | Channel solution | Risk of sounding like generic inbox automation | Show structured intake-to-CRM workflow and clearly state no WhatsApp partnership |
| `/business-process-automation` | Orchestration solution | Generic capability/outcome repetition | Lead with system handoffs, exception path and integration map |
| `/custom-ai-development` | Bespoke solution | Needs a clearer “when custom is justified” decision | Add fit criteria, delivery boundary and ownership model |
| `/ai-employees/*` | Role-specific intent | Four pages share a template so closely that roles can blur | Keep shell but vary daily workflow, supervised decisions and role-specific scenario |
| `/industries/*` | Industry intent | Safe language is strong; domain specificity is shallow | Use industry journey, approved data, red lines and meaningful operating measures |
| `/locations/hubli` | Local relevance | Local story may read like the old brand identity | Position Hubballi as operating origin and proximity advantage within TORVENT |
| `/about` | Founder and company trust | Old brand copy and image alt; founder story is solid but page is template-heavy | Make TORVENT mission + Rohit’s multidisciplinary path the editorial center |
| `/case-studies` | Evidence policy/workflow library | No customer proof yet; current label can feel defensive | Rename narrative around representative workflow blueprints and publication standard |
| `/trust` | Governance | Honest but abstract | Add a simple control model: data, access, action, review, retention |
| `/insights` | Education and SEO | Topics are described, but there is no substantive article library yet | Present as a concise resource index and avoid implying a mature publication archive |
| `/contact` | Primary conversion | Clear and usable; CTA/channel language differs from rest of site | Align heading with “Show Us Your Workflow,” retain WhatsApp disclosure, simplify footer |
| `/privacy`, `/terms`, `/cookies` | Provisional legal notices | Old brand references; required entity details pending | Update brand, retain factual provisional notes and footer access |
| `/crm` | Internal device-local lead tool | Not integrated with public conversion and not multi-user | Keep excluded from sitemap; relabel TORVENT; clearly maintain device-local limitation |

## Content and claim audit

- No fabricated customers, testimonials, partner logos, certifications or achieved metrics were found.
- Illustrative operating metrics are explicitly qualified; this should remain.
- “Built in Hubballi” is supportable as founder/location provenance; “serving India and beyond” should remain capability language, not proof of customers.
- Healthcare copy correctly limits use to administration and access, not diagnosis.
- “Responsible AI” is acceptable only when paired with the specific controls already described: scoped access, approvals, human escalation and reviewable activity.

## Audit conclusion

The highest-leverage move is not adding more sections. It is consolidating the company into one TORVENT identity, one navigation and CTA system, one coherent design token layer, and a more varied narrative rhythm. The redesign should preserve the site’s honest boundaries, multilingual intelligence and calm character while making the opening more cinematic and the product model more tangible.
