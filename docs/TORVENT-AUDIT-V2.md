# TORVENT Website Audit V2

**Audit date:** 24 August 2026

**Production URL:** https://rooohi.github.io/hbl-001-supreme-clinic-demo/
**Scope:** Production homepage, mobile navigation, representative solution/contact pages, repository structure, shared shell, content configuration, metadata, structured data, accessibility, performance posture and responsive behaviour.

## Executive assessment

TORVENT already has a credible base: a restrained palette, a clear operational-AI proposition, real Kannada copy, honest qualification of illustrative outcomes, and a functioning static Next.js deployment. The current experience does not yet feel like one mature product system. The hero is visually clean but generic, the second viewport is consumed by Workflow Studio, the navigation requires click-open desktop menus, role and subpage content relies heavily on repeated cards, and a personal phone/founder identity is embedded throughout conversion, trust, legal, CRM and structured-data surfaces.

V2 should move the brand from a collection of marketing sections to a composed operating narrative: one memorable hero, one coherent workflow model, controlled AI-role visuals, strong editorial rhythm, explicit human review, and organization-level trust language. The highest-value changes are the hero, header behaviour, contact-channel cleanup, architecture explanation, and removal of repeated surfaces.

## Evidence captured

The audit captured and reviewed these production states:

1. Desktop homepage hero.
2. Homepage second viewport / Workflow Studio.
3. Homepage AI-role section.
4. Homepage architecture section.
5. Full AI Agents page.
6. Full Contact page.
7. Homepage at 390 px.
8. Mobile navigation at 390 px.

Screenshots are stored in the task evidence folder `torvent-audit-v2` and were visually inspected at their captured viewports.

## What is working

- **Brand restraint:** forest green, soft green, graphite, white and muted blue already provide a credible calm foundation.
- **Plain-language positioning:** the site explains operational AI without excessive technical jargon.
- **Responsible claims:** representative blueprints and outcome measures are labelled rather than presented as customer proof.
- **Local relevance:** Kannada and mixed-language examples make the proposition specific to how Indian customers communicate.
- **Responsive foundation:** the site renders without horizontal breakage at 390 px and its primary mobile CTA remains reachable.
- **Technical foundation:** Next.js static export, a shared configuration object, reusable shell components, generated sitemap/robots and automated rendered-HTML tests are present.
- **Accessibility basics:** semantic links, headings, labels and native details elements provide a usable starting point.

## Priority findings

### P0 — Launch blockers

#### 1. Personal contact data is part of the public product surface

The founder mobile number appears in central configuration, the footer, contact page, form fallback, CRM copy, tests and public contact actions. The founder identity also appears in metadata, structured data and About/contact conversion language.

**Required:** remove the number, WhatsApp fallback, `tel:` links and person-level ownership language from rendered pages, configuration, metadata/schema, tests and source. Do not replace them with a fabricated number or email. When no contact endpoint exists, show an explicit configuration TODO and do not imply submission succeeded.

#### 2. Desktop navigation behaviour is not production-grade

Desktop dropdowns use native `<details>`, so they require click, remain open until another action, and lack coordinated close delay. Mobile navigation is one long sheet rather than grouped disclosure.

**Required:** create hover/focus dropdowns with keyboard support, Escape handling and a 100–180 ms close delay; keep click/tap accordion behaviour on mobile. Treat logo, navigation and CTA as three independent layout groups.

#### 3. The hero does not own a distinctive TORVENT idea

The current centered two-line hero is clean but could belong to many AI consultancies. The background uses a faint horizontal wordmark rather than a proprietary workflow or intelligence metaphor. At 390 px the headline becomes four lines and pushes the experience toward a standard stacked landing page.

**Required:** rebuild the first 85–95svh around one proposition, short copy, two actions, controlled V geometry, deterministic workflow trajectories and one small live-workflow moment. Preserve calm contrast and avoid particles, robots, faces, stock imagery and generic glowing-orb imagery.

### P1 — Major experience issues

#### 4. Workflow Studio dominates the second viewport

The interactive panel consumes the first complete section after the hero, interrupting the company story and making the page feel like a prompt demo.

**Required:** remove Workflow Studio from the rendered homepage DOM. Reuse its logic elsewhere only if it serves a deliberate product demonstration.

#### 5. The architecture explanation is not an architecture

The current “How work moves” section is four disconnected cards. It omits the relationship between channels, understanding, policy, orchestration, tools, outcomes, human review and observability.

**Required:** create an accessible, responsive infrastructure diagram showing:

`Customer → Channels → TORVENT Agent → Understanding → Knowledge & Policy → Orchestration → Tools & Actions → Outcome → Audit & Observability`

Human review must branch from orchestration and return to a visible controlled path.

#### 6. Role presentation is text-heavy and visually interchangeable

The four AI-role cards use pastel blocks, icons and comparable copy lengths. They explain roles but do not communicate an AI-native operating model.

**Required:** create four distinct computational visuals with shared composition rules, dark forest/graphite surfaces and restrained neon-green signals. Each role needs a concise responsibility, inputs/actions and escalation boundary.

#### 7. Subpages repeat the same card grammar

The AI Agents page and other dynamic routes repeatedly use hero → split text → four cards → four-step blueprint → list → outcome grid → FAQ → CTA. Long pages have weak contrast between ideas.

**Required:** preserve shared structure but introduce route-specific editorial modules, meaningful diagrams and fewer equal-weight cards. Diagrams should appear only where they clarify a real workflow.

#### 8. Trust language is person-dependent

Phrases such as “named person,” “named owner,” “talk to the founder” and “founder” make accountability sound informal and dependent on one individual.

**Required:** use organization-level language: human review, accountable team, escalation rule, policy owner, permitted action and activity history.

### P2 — Important refinements

#### 9. Operational proof is underdeveloped

The current site avoids fabricated claims, which is correct, but lacks a compelling explanation of what teams can measure.

**Required:** show illustrative/sample measurement types—response time, completion rate, escalation rate, recovery rate, handoff quality and action success—without zero-value dashboards or invented performance numbers.

#### 10. Industry exploration is a static link list

Industry rows are navigable but do not preview how the workflow changes by context.

**Required:** build an editorial selector with pointer, focus and tap states that updates a nearby workflow preview while maintaining accessible links to the full industry pages.

#### 11. Global story is visually weak

The existing Hubballi/Karnataka/India/global sequence does not feel like a deliberate growth trajectory, and “Beyond India” is not an approved phrase.

**Required:** use “BUILT IN HUBBALLI. DESIGNED FOR GLOBAL SCALE.” with a precise Hubballi → Karnataka → India → Global Scale visual progression.

#### 12. Section hierarchy is too uniform

Repeated containers, rounded cards and centered headings reduce momentum and make important claims compete with supporting content.

**Required:** alternate dark and light editorial fields, use whitespace as structure, reserve rounded cards for true grouped objects, and keep desktop headings on one line where reasonable.

#### 13. CTA vocabulary drifts across routes

Primary actions use several labels and channel-specific language.

**Required:** standardize on **SHOW US YOUR WORKFLOW** and **SEE HOW TORVENT WORKS**. Do not imply a live communication channel until one is configured.

### P3 — Polish and resilience

- Add deliberate focus-visible states that match hover treatment.
- Ensure all interactive previews work with keyboard and tap.
- Add `prefers-reduced-motion` fallbacks for type, path, chart and reveal animation.
- Prevent headline orphans between 320 and 430 px and at 768/1024 px tablet widths.
- Keep body measure near 55–68 characters and maintain 2–3-line supporting copy.
- Use icon-library assets consistently; do not use emoji or improvised symbol art.
- Reserve animation for comprehension: navigation transition, workflow path progression, role state changes and illustrative measure reveals.

## Information architecture recommendation

### Global navigation

- **Solutions:** AI Agents, Voice AI, WhatsApp Automation, Process Automation, Custom AI.
- **AI Roles:** Sales Agent, Receptionist, Admission Officer, Support Agent.
- **Industries:** Education, Healthcare, Real Estate, Manufacturing, Service Businesses.
- **Company:** About, Workflow Library, Trust, Insights.
- **Primary CTA:** Show Us Your Workflow.

### Homepage narrative

1. Hero — proposition + two actions + controlled workflow moment.
2. Operating premise — what TORVENT owns and what remains human.
3. AI roles — four visual operating roles.
4. How work moves — real infrastructure diagram.
5. Language intelligence — Kannada/English/Hindi mixed-context understanding.
6. Operational measures — clearly labelled illustrative measurement model.
7. Industries — editorial selector and live workflow preview.
8. Growth trajectory — Hubballi → Karnataka → India → Global Scale.
9. Accountability — knowledge, permissions, actions, escalation and history.
10. Focused final CTA.

## Content direction

### Recommended hero

**Headline:** AI that works for your business.

**Supporting copy:** TORVENT designs AI roles that understand requests, use approved knowledge, take permitted actions and hand exceptions to your team.

**Primary:** SHOW US YOUR WORKFLOW
**Secondary:** SEE HOW TORVENT WORKS

### Core message system

- **Positioning:** operational AI for complete business workflows, not isolated chat.
- **Trust:** clear knowledge, permissions, actions, escalation and history.
- **Local relevance:** built in Hubballi, fluent in how India communicates, designed for global scale.
- **Proof posture:** measurement-ready and evidence-led; no invented customers, certifications or outcomes.

## Accessibility assessment

**Current health:** Needs work.

- Native semantic foundations are present.
- Desktop dropdown behaviour and mobile menu grouping need explicit keyboard/focus design.
- Interactive industry/diagram components must expose state through buttons, labels and live regions rather than motion alone.
- Decorative visuals should be hidden from assistive technology; meaningful diagrams need a concise text equivalent.
- Reduced-motion handling must cover all new animations.

## Responsive assessment

**Current health:** Functional but not resolved.

- The 390 px hero is usable, but its four-line headline weakens hierarchy.
- The mobile menu is long and visually dense.
- Card grids stack safely but create excessive scroll and repetition.
- V2 must be checked at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 and 1920+ px.

## SEO and structured-data assessment

**Current health:** Good foundation with material cleanup required.

- Sitemap, robots and metadata exist.
- Person authorship/creator/founder schema and telephone data conflict with the new organization-first requirement.
- Titles/descriptions should be rewritten around operational AI intent and route-specific value.
- Organization/service schema must contain only verified business facts and no placeholder contact channel.
- CRM should remain excluded from public indexing and navigation.

## Performance assessment

**Current health:** Reasonable static foundation; redesign risk must be controlled.

- Prefer CSS transforms/opacity for motion and avoid continuous large-area filters.
- Reuse the provided raster logo without stretching; preserve intrinsic ratio.
- Generated visual assets must be appropriately sized, compressed and lazy-loaded below the fold.
- Avoid client components unless interaction genuinely requires them.

## Source cleanup targets

The V2 implementation must explicitly search and resolve public/source occurrences of:

- `7353260596`, `73532 60596`, `+917353260596`
- `founder`
- `named person`
- `named owner`
- `Beyond India`
- `Workflow Studio`
- `AI Automation Hubballi`
- `Supreme Clinic`, `clinic dashboard` and obsolete clinic assets/content

Historical audit/report documents may preserve quoted evidence, but production code, configuration, tests, metadata and rendered output must not contain the removed personal contact or obsolete public brand language.

## Definition of done

V2 is complete only when the selected visual direction is implemented across the shared shell and all routes; desktop/mobile navigation works by pointer, focus, keyboard and tap; prohibited public content is removed; the homepage story no longer renders Workflow Studio; responsive and reduced-motion states are verified; build/lint/tests pass; broken links and console errors are checked; `docs/TORVENT-REDESIGN-V2-REPORT.md` records the final system and search results; and the verified build is committed and deployed to the existing GitHub Pages URL.
