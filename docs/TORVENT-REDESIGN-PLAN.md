# TORVENT redesign plan

Date: 24 August 2026

## 1. Executive summary of changes

Rebuild the shared system before polishing individual pages. TORVENT becomes the only public brand, Hubballi remains the origin story, and all conversion routes use one primary action: **Show Us Your Workflow**. The homepage moves from a light, card-led catalogue to a premium dark-to-light narrative: cinematic hero, trust cues, interactive workflow preview, architecture, AI roles, multilingual intelligence, proof standard, industries, governance, origin and final conversion.

Interior pages keep their search intent and factual content but use the same header, page-intro system, workflow visual language, evidence rules and footer. Repetition is reduced through editorial layouts, connected rails, compact data bands and differentiated scenarios.

## 2. New homepage architecture

1. Unified transparent/glass header with TORVENT wordmark and primary CTA.
2. Dark cinematic hero: one proposition, short supporting copy, primary and secondary CTA, restrained intelligence-field motion.
3. Compact credibility strip: permissions, existing tools, mixed language, human review.
4. Interactive workflow preview, clearly labelled as a local demonstration.
5. Connected-work architecture: request → context → action → record, with a continuous control layer.
6. AI roles in an asymmetric editorial composition with one featured role.
7. Mixed-language intelligence section using real Kannada, English and Hindi context.
8. Operating evidence section with illustrative, explicitly labelled measures.
9. Industry workflows as a compact indexed list, not another card grid.
10. Governance model and Hubballi-to-wider-operations origin story.
11. Final conversion CTA and compact footer.

## 3. Reusable component system

- `SiteHeader`: one global navigation model with dropdowns, mobile disclosure and persistent CTA.
- `BrandLogo`: supplied TORVENT wordmark, fixed aspect ratio and context-aware size.
- `Button`: primary, secondary and text-link variants with one label system.
- `PageIntro`: eyebrow, intent-led H1, description, CTA and trust note.
- `WorkflowPreview`: local request-to-action demonstration with side-sheet result.
- `WorkflowRail`: connected architecture or journey with numbered stages and control layer.
- `EditorialFeature`: asymmetric text/visual composition for differentiated pacing.
- `EvidenceBand`: illustrative measures and explicit evidence qualification.
- `TrustModel`: data, permissions, action, human review and retention.
- `FAQ`: native disclosure with clear focus state.
- `Footer`: compact brand, contact, navigation and legal closure.

## 4. Content rewrite plan

- Replace every public “AI Automation Hubballi” reference with TORVENT; keep Hubballi in origin/location copy.
- Preserve the clear proposition “Turn customer requests into finished work.” because it explains an outcome rather than a technology category.
- Standardize the primary CTA to “Show Us Your Workflow” and secondary to “See How It Works.”
- Write from the reader’s operating problem: requests waiting, details being re-entered, follow-ups being missed, decisions requiring a person.
- Replace generic outcomes with page-specific operating measures and explicit “baseline required” language.
- Keep Kannada words in Kannada script and preserve mixed-language examples.
- Keep case studies honest: representative workflow blueprints until customer-approved evidence exists.
- Keep legal notices factual and provisional; do not imply registration, certification, customers or commercial terms that are unavailable.

## 5. SEO improvements

- Make TORVENT the Organization/ProfessionalService name in metadata and JSON-LD.
- Add route-specific titles and descriptions aligned to AI agents, voice AI, WhatsApp automation, process automation, role and industry intent.
- Keep local relevance in dedicated Hubballi/Karnataka content and descriptive metadata, not in the brand name.
- Validate canonical, OG image, favicon, sitemap and robots paths under the GitHub Pages base path.
- Preserve one descriptive H1 per page and logical H2/H3 hierarchy.
- Keep `/crm` out of sitemap and search access guidance.

## 6. Performance improvements

- Remove the remote hero MP4 and its runtime dependency.
- Use local optimized wordmark plus CSS gradient/light-field effects.
- Restrict animation to opacity and transforms; stop nonessential motion for reduced-motion users.
- Keep below-fold interactive code isolated and lightweight.
- Reduce duplicated CSS and consolidate component tokens.
- Retain static export and test the generated `out` directory.

## 7. Accessibility improvements

- Target WCAG 2.2 AA contrast for text, focus and controls.
- Keep skip links and one main landmark per route.
- Ensure navigation is fully keyboard operable, closes on Escape/route change and exposes expanded state.
- Keep 44 px minimum touch targets and visible focus rings.
- Preserve form labels, inline errors, error focus and no-sensitive-data guidance.
- Verify Kannada/mixed-language wrapping and `lang` attributes where text changes language.
- Respect `prefers-reduced-motion` and avoid auto-playing media.

## 8. Responsive redesign strategy

- Fluid type and spacing tokens rather than desktop-only fixed values.
- 320–430 px: single-column narrative, compact logo, full-width primary CTA, horizontally safe workflow rail and readable mixed-language examples.
- 768–1024 px: two-column editorial layouts where hierarchy remains clear; never squeeze four equal cards.
- Desktop: wider negative space and asymmetric layouts, with a controlled maximum reading measure.
- Test home, mobile navigation, representative service/role/industry pages, About, Trust and Contact.

## 9. Implementation order

1. Brand/config migration and token layer.
2. Unified header, CTA and footer.
3. Homepage hero and workflow preview.
4. Homepage hierarchy and component variety.
5. Shared interior-page shell and route-specific content polish.
6. Metadata, schema, sitemap and robots verification.
7. Accessibility and reduced-motion pass.
8. Desktop/mobile build QA, rendered-HTML tests and live verification.

## 10. QA checklist

- TORVENT is the only public brand name; Hubballi appears only as origin/location.
- Wordmark is never distorted and remains legible at every breakpoint.
- Primary CTA label and destination are consistent.
- Header and mobile navigation expose every required group.
- No horizontal overflow at 320, 390, 768, 1024 and 1440 px.
- Keyboard focus is visible; menus and FAQ controls are operable.
- Reduced-motion mode removes looping decorative motion.
- Every route has one H1, descriptive title, meta description and canonical.
- No fabricated claim, customer, logo, metric or certification is introduced.
- Contact form validation and WhatsApp fallback work.
- `/crm` remains device-local, unlinked publicly and absent from sitemap.
- Static build, tests and GitHub Pages deployment complete successfully.
