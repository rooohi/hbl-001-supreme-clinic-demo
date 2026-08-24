# TORVENT Website Redesign V2 — Build Report

## Executive summary

TORVENT now presents as a focused AI company rather than a template-led automation site. The redesign gives the homepage one clear story: TORVENT builds practical AI systems that take on useful business work with human oversight. The visual language is calm, premium, and recognizable, while the content avoids unsupported claims.

## What changed

### 1. Hero

- Rebuilt as a centralized, nearly full-viewport composition.
- Reduced to one primary CTA: **Show us one workflow**.
- Removed the chat component and architecture diagram from the hero.
- Added a real abstract brand asset based on TORVENT's V geometry.
- Kept the content concise so the brand promise is understood quickly.

### 2. Navigation

- Rebuilt as independent glass groups for logo, navigation, and CTA.
- Added accessible desktop dropdowns with hover, focus, keyboard, click, delay, and Escape behavior.
- Rebuilt mobile navigation with grouped accordions and clearer tap targets.
- Preserved the logo's natural aspect ratio and increased its visual presence.

### 3. Design system

- Introduced a deep forest base, warm white surfaces, pastel mint, restrained blue, and quiet grey.
- Consolidated radii, borders, shadows, spacing, motion, and type hierarchy in `app/v2.css`.
- Added responsive layouts for desktop, tablet, and narrow mobile widths.
- Added reduced-motion support.

### 4. Content architecture

The homepage now follows a deliberate sequence:

1. concise promise;
2. business premise;
3. AI role examples;
4. implementation architecture;
5. language intelligence;
6. illustrative performance measures;
7. interactive industry relevance;
8. Hubballi-to-global trajectory;
9. operating boundaries and trust;
10. single conversion path.

Repeated promotional copy was removed or consolidated. The remaining copy is plain-language, professional, and locally grounded without limiting TORVENT to one geography.

### 5. AI role visuals

Four original raster assets were generated and optimized for sales, reception, admissions, and support roles. They use one consistent visual system and replace unrelated stock photography.

### 6. Architecture explanation

The architecture moved below the hero, where a visitor has enough context to understand it. It now explains inputs, TORVENT's orchestration layer, business systems, and human review as an operational flow instead of decoration.

### 7. Language and local relevance

Language support is framed as practical customer access and operational continuity. Local grounding is communicated through Hubballi, Karnataka, and India without relying on identity-heavy founder copy.

### 8. Performance communication

The performance section uses animated illustrative measures and clearly avoids presenting sample values as customer outcomes. It communicates what should be measured after deployment rather than claiming results TORVENT cannot yet substantiate.

### 9. Industry selector

An accessible interactive selector lets visitors explore relevant outcomes for different industries. Hover, focus, click, and keyboard-compatible controls update a shared contextual preview.

### 10. Growth narrative

The former starting-point chips were replaced with a coherent trajectory: Hubballi → Karnataka → India → Global Scale. Alignment and hierarchy now communicate expanding readiness rather than disconnected locations.

### 11. Trust and boundaries

- Human review is explicit for consequential actions.
- Sensitive decisions are not described as fully autonomous.
- No fake certifications, customers, guarantees, or security claims were added.
- Internal CRM remains excluded from public navigation and search indexing.

### 12. About, Contact, and legal structure

- About is organization-led rather than founder-led.
- The public personal phone number and founder identity were removed.
- Contact states honestly that business enquiries are being configured because no official inbox or endpoint is available.
- Trust and legal content avoids implying unavailable legal or compliance documents.

### 13. SEO

- Updated organization metadata, title, description, and structured data.
- Removed person-level authorship and telephone schema.
- Preserved static routes, sitemap, and robots output.
- CRM remains non-indexed.

### 14. Performance

- Role and hero assets were converted to WebP and kept compact.
- Pages are statically generated for GitHub Pages.
- Removed two unused workflow components and an unused founder image.
- The production build completes successfully.

### 15. Accessibility

- Semantic navigation and heading structure.
- Keyboard-operable dropdowns and mobile accordions.
- Visible focus treatments.
- Accessible status messaging in Contact.
- Responsive tap targets and motion reduction.

### 16. Verification

- Production build: passed.
- TypeScript: passed.
- Rendered HTML tests: passed.
- Desktop hero: checked at 1440 x 1024.
- Mobile hero/navigation: checked at 390 x 844.
- Primary CTA and Contact journey: checked.
- Homepage and Contact console: no errors or warnings.
- Visual comparison: completed against the selected design direction.

### 17. Production search checks

The production app, component, configuration, and asset source was checked for:

- founder personal phone number;
- founder name and biography fragments;
- `named person` and `named owner` language;
- `Beyond India`;
- `Workflow Studio`;
- obsolete clinic branding.

No matches remain in production source. Historical reports are retained under `docs/` for traceability and are not shipped as page content.

## One remaining launch dependency

An official business email or form/CRM endpoint is still required before enquiries can be submitted. Until that is provided, the Contact page deliberately shows a transparent configuration status instead of sending visitors to a personal mobile number or pretending a form is connected.
