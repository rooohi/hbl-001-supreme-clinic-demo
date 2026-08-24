# TORVENT redesign report

Date: 24 August 2026

## Completed work

### Brand and content

- Migrated the public identity from “AI Automation Hubballi” to **TORVENT** in central configuration, metadata, structured data, footer copyright, About copy, trust/legal notices, WhatsApp enquiry copy, CRM description and generated tests.
- Retained Hubballi, Karnataka as the company’s origin and local operating context rather than the brand name.
- Standardized the primary conversion action to **Show Us Your Workflow**.
- Added **See How It Works** as the homepage secondary action.
- Preserved factual boundaries: no fabricated customers, metrics, certifications, partners or testimonials.

### Global shell

- Replaced two competing navigation models with one site-wide system.
- Navigation now exposes Solutions, AI Roles, Industries, Insights and Company on every route.
- Added the primary CTA to desktop navigation across home and interior routes.
- Retained a compact grouped mobile menu with WhatsApp access.
- Added route-change and Escape closing behavior for mobile navigation.
- Preserved the supplied TORVENT wordmark’s aspect ratio and increased its usable visual scale without stretching it.

### Homepage

- Rebuilt the hero as a dark graphite/green TORVENT environment with one dominant proposition.
- Removed the remote CloudFront hero MP4 and replaced it with the local wordmark plus restrained gradient/light-field motion.
- Kept the looping typewriter line and no cursor after the completed full stop.
- Added a clearly labelled local interactive Workflow Studio immediately below the credibility strip, outside the hero.
- The studio maps a user-selected process into Receive, Understand, Act and Review stages and opens an accessible side-sheet result.
- Changed AI roles from four equal cards to an asymmetric editorial hierarchy.
- Preserved the strongest multilingual, architecture, proof, industry, governance and Hubballi-origin content.

### SEO and technical

- TORVENT now populates page-title templates, Open Graph data and Organization/ProfessionalService JSON-LD through central configuration.
- Canonicals, sitemap, robots and the GitHub Pages base path remain in place.
- Static export still produces 29 routes.
- `/crm` remains excluded from the sitemap and described as device-local.
- The decorative hero no longer depends on an external runtime video request.

### Accessibility and responsive behavior

- Preserved skip links, semantic headings, labelled fields, form-error focus and workflow-dialog focus containment.
- Kept 44 px-class touch targets for primary mobile controls.
- Added reduced-motion handling for the new hero field.
- Tested the homepage, interactive workflow result and mobile navigation at 390 × 844.
- The mobile credibility strip intentionally uses a contained horizontal scroller rather than compressing four proof items into unreadable columns.

## Verification performed

- `npm run lint` — passed.
- `npm test` — passed all four rendered-HTML suites.
- `next build` — compiled, type-checked and statically generated 29 pages.
- Homepage DOM verification confirmed one H1, all global navigation groups, both hero CTAs, Workflow Studio and multilingual content.
- Workflow interaction verification confirmed the starter action enables the mapper and produces a visible “Admission enquiry workflow” result in the dialog.
- Mobile screenshot verification confirmed compact header, mobile menu, stacked hero actions and responsive hero content.

## Visual QA evidence

- `15-redesign-home-final.png` — completed desktop hero state.
- `16-workflow-studio.png` — workflow-studio section after secondary CTA navigation.
- `17-workflow-result.png` — generated workflow side sheet.
- `18-home-mobile.png` — 390 × 844 homepage.
- `19-mobile-menu.png` — open mobile navigation.

These files are stored in the TORVENT site-audit evidence folder outside the repository and are not deployed with the website.

## Known launch boundaries

- The contact form continues to use a disclosed WhatsApp fallback until a secure form endpoint or shared CRM is available.
- The CRM is intentionally device-local and is not a multi-user production CRM.
- Legal entity, jurisdiction, custom domain and formal commercial terms remain pending, as requested.
- Public customer case studies remain unpublished until customer-approved evidence exists.

## Result

TORVENT now presents one coherent brand, a clearer conversion journey, a more premium opening, a tangible interactive explanation and a more varied homepage hierarchy while preserving the original calm green/grey/white/blue character and the site’s honest trust posture.
