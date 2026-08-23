# AI Automation Hubballi

Public website and device-local lead workspace for AI Automation Hubballi.

## Stack

- Next.js 16 and React 19
- TypeScript
- Phosphor Icons
- Static export hosted by GitHub Pages
- GitHub Actions deployment

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
```

## Public routes

The marketing site contains solution, AI role, industry, company, workflow library, trust, contact and legal-information pages. `/crm/` is deliberately excluded from the sitemap and search indexing.

## Lead workflow

Until a secure backend is approved, public enquiries are prepared as a WhatsApp message for `+91 73532 60596`. The visitor must review and send the message in WhatsApp.

The CRM is a browser-local workspace. Records stay in local storage on the current device and can be exported or imported as JSON. It is not a shared, authenticated or automatically synchronised CRM.

## Deployment

The site is exported with the repository base path `/hbl-001-supreme-clinic-demo` and deployed to GitHub Pages from the `codex/ai-company` branch workflow.

Custom-domain setup is intentionally pending until a domain is available.
