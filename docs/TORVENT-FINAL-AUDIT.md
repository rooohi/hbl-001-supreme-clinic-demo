# TORVENT final website audit

Date: 25 August 2026
Scope: final quality pass on the existing TORVENT design and implementation. This audit does not propose a new visual direction.

## Evidence and coverage

The deployed site was visually reviewed at the homepage and contact conversion route. A DOM and accessibility-structure audit was then run across every generated public route:

- `/`, `/about/`, `/ai-agents/`, `/ai-voice-agents/`, `/whatsapp-ai-automation/`, `/business-process-automation/`, `/custom-ai-development/`
- `/ai-employees/sales-agent/`, `/ai-employees/receptionist/`, `/ai-employees/admission-officer/`, `/ai-employees/support-agent/`
- `/industries/education/`, `/industries/healthcare/`, `/industries/real-estate/`, `/industries/manufacturing/`, `/industries/service-businesses/`
- `/locations/hubli/`, `/case-studies/`, `/insights/`, `/trust/`, `/contact/`
- `/privacy/`, `/terms/`, `/cookies/`, `/crm/`

All audited routes have one H1, a main landmark, a usable title, no missing image alt attributes, no unnamed visible buttons, no empty links and no horizontal overflow at the audited desktop viewport. The public CRM is excluded from the sitemap and is already marked `noindex`.

Visual evidence is stored outside the product repository in `torvent-final-audit/01-home-current.png` and `torvent-final-audit/02-contact-current.png`. Machine-readable pre-change route results are stored alongside them in `route-audit-before.json`.

## Findings

### CRITICAL

#### Conversion — the only enquiry journey is publicly disabled

- **Where:** `/contact/`, `components/contact-form.tsx`
- **What is wrong:** the page says “Business enquiries are being configured”, “No information can be submitted” and visibly exposes a “Launch TODO”.
- **Why it matters:** this stops the primary business journey after every site CTA and makes the company appear unfinished.
- **Recommended fix:** replace the unavailable state with the existing accessible enquiry form and a transparent WhatsApp handoff using the approved business number. Validate locally, avoid collecting sensitive data and clearly state that the visitor reviews the message before sending.

### HIGH

#### Motion — hero typewriter continuously erases and repeats

- **Where:** homepage hero, `components/hero-typewriter.tsx`
- **What is wrong:** the primary promise repeatedly disappears, contradicting the specified one-time behavior and making the heading harder to scan.
- **Why it matters:** the most important message is unstable and visually distracting.
- **Recommended fix:** type once without a cursor, preserve the final sentence, reserve layout height and show the complete sentence immediately for reduced-motion users.

#### Content and privacy — a named person remains in public copy

- **Where:** contact FAQ and `/privacy/`
- **What is wrong:** “Rohit” is named as the person responding to enquiries.
- **Why it matters:** it conflicts with the brand-led company presentation and the explicit requirement to remove named-person and owner references.
- **Recommended fix:** use “the TORVENT team” consistently and describe the contact process without personal attribution.

#### Typography — supporting UI text falls below the approved minimum

- **Where:** homepage industry explorer, trajectory, boundary rail, footer, contact notes and several technical labels.
- **What is wrong:** visible copy uses 7–12px sizes; the route audit counted repeated visible text below 13px.
- **Why it matters:** it weakens hierarchy, readability and WCAG usability, especially on high-density and mobile screens.
- **Recommended fix:** raise informative labels to 13–14px, secondary copy to 15–17px and maintain 1.5–1.7 line-height. Keep only non-essential decorative counters below 13px.

#### UX and responsive — the fixed mobile contact bar competes with page content

- **Where:** all public routes below 600px.
- **What is wrong:** a persistent bottom CTA adds a second navigation layer and forces body padding even where the page already has clear CTAs.
- **Why it matters:** it reduces usable mobile viewport height and risks covering content or browser controls.
- **Recommended fix:** remove the legacy floating contact bar and rely on the deliberate header/menu and in-flow CTAs.

### MEDIUM

#### Performance — unused render-blocking display font

- **Where:** `app/globals.css`
- **What is wrong:** an external Bubbledot font import remains although the current V2 brand direction uses Manrope; related legacy cinematic selectors are not part of the active hero.
- **Why it matters:** it adds another cross-origin CSS/font dependency before first render.
- **Recommended fix:** remove the unused import and retain one restrained font request for Manrope and Kannada support.

#### Technical — accumulated legacy and V2 CSS create conflicting definitions

- **Where:** `app/globals.css`, `app/v2.css`
- **What is wrong:** repeated definitions for route transitions, role cards, brand sizing and typography create override-dependent behavior.
- **Why it matters:** future refinements become fragile and breakpoint behavior is harder to predict.
- **Recommended fix:** remove confirmed-dead imports/selectors and consolidate final values at the end of the active V2 layer without changing the selected visual direction.

#### Accessibility — several interactive hover rules suppress focus outlines

- **Where:** desktop dropdown links, header CTA, role cards and industry tabs in `app/v2.css`.
- **What is wrong:** combined hover/focus selectors set `outline: 0`; a global focus rule usually compensates, but cascade order can make the state inconsistent.
- **Why it matters:** keyboard users need a clear, reliable focus indicator.
- **Recommended fix:** give all active interactive systems an explicit, high-contrast `:focus-visible` ring and maintain at least 44px touch targets.

#### Motion and performance — ambient hero animation runs continuously

- **Where:** homepage hero background.
- **What is wrong:** a large full-bleed image continuously scales and changes filter brightness.
- **Why it matters:** it consumes rendering resources and conflicts with the brief’s restraint on constant motion.
- **Recommended fix:** use a slower, transform-only single-direction settle or static treatment; disable all ambient motion under `prefers-reduced-motion`.

#### SEO — structured-data logo points to the favicon

- **Where:** `app/layout.tsx`
- **What is wrong:** Organization schema identifies the favicon instead of the supplied TORVENT wordmark asset.
- **Why it matters:** structured brand identity is less precise than the visible site.
- **Recommended fix:** reference the supplied logo asset and add consistent Open Graph type, locale and brand fields without keyword stuffing.

#### Content — temporary launch language appears in legal pages

- **Where:** `/privacy/`, `/terms/`, `/cookies/`
- **What is wrong:** “pending configuration” and other internal launch language is visible.
- **Why it matters:** it reads like implementation notes rather than a polished public policy structure.
- **Recommended fix:** state current limitations plainly without internal TODO language. Keep the existing disclaimer that commercial legal terms require professional review.

#### Brand and technical — CRM export retains an outdated filename

- **Where:** `components/crm-workspace.tsx`
- **What is wrong:** exports are named `ai-automation-hubballi-leads-*`.
- **Why it matters:** downloaded operational artifacts should carry the current TORVENT brand.
- **Recommended fix:** rename exports and the browser-storage key to TORVENT while preserving compatibility with existing stored leads.

### LOW

#### Layout — contact introduction dominates before the useful action

- **Where:** `/contact/`
- **What is wrong:** the large editorial heading and status card push the actual conversion content down.
- **Why it matters:** visitors arrive ready to act and should reach the form quickly.
- **Recommended fix:** keep the existing editorial style but tighten vertical spacing and place the working form clearly beside the concise workflow prompt.

#### Content — repeated supervision phrasing across detail pages

- **Where:** solution, AI-role and industry templates.
- **What is wrong:** human review and exception handling are repeated in the hero, capability copy, blueprint, delivery and outcome sections.
- **Why it matters:** repetition makes otherwise strong pages feel templated.
- **Recommended fix:** retain one concise hero assurance, let the blueprint explain the mechanism and remove redundant supporting sentences where the same concept is already clear.

#### SEO — legal routes share the generic “LEGAL” title

- **Where:** `/privacy/`, `/terms/`, `/cookies/`
- **What is wrong:** generated titles use the shared eyebrow rather than the specific page title.
- **Why it matters:** browser tabs and search results are less distinguishable.
- **Recommended fix:** generate specific titles from each page’s actual title while preserving TORVENT’s title template.

## What is already working

- The restrained forest, white, pastel green and blue system is coherent and recognisably TORVENT.
- The supplied wordmark is used as an image and is not recreated with text.
- The homepage hero is centralised, calm and maintains one primary CTA.
- Navigation information architecture is clear across solutions, roles, industries, insights and company content.
- Detail pages have a consistent operational narrative: problem, capability, workflow, delivery, measures and boundaries.
- Representative workflow examples are honestly labelled and do not invent customer results.
- Semantic route structure, H1 usage, canonical metadata, sitemap and robots foundations are present.
- Reduced-motion CSS, a skip link, visible form labels and accessible controls already provide a strong accessibility base.

## Implementation priority

1. Restore the contact conversion path and remove public launch TODO language.
2. change the hero typewriter to a one-time, layout-stable animation.
3. remove named-person and outdated-brand references.
4. improve minimum text sizes, focus visibility and mobile pacing.
5. clean font/loading, metadata and schema details.
6. run full build, link, responsive, accessibility and deployed-route verification.
