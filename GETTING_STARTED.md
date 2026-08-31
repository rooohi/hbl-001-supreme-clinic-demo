# Getting started

## Prerequisites

- Node.js 22.13 or newer.
- npm.
- The repository workspace on a writable local path.

## Setup

```bash
npm install
Copy-Item .env.example .env.local
npx wrangler d1 migrations apply DB --local --config wrangler.local.jsonc
npm run dev
```

The local Cloudflare/Vite runtime provides the `DB` D1 and `FILES` R2 bindings declared in `.openai/hosting.json`. Wrangler state stays under `.wrangler/` and is ignored by Git.

## Preview identities

Anonymous local requests use the bounded development staff adapter. This is intentional only for local/private preview work. Production requests require the hosting identity header, but the current mapping is not a complete RBAC implementation.

For local permission checks, send `x-twacha-dev-role: doctor`, `receptionist`, or `owner`. Never expose this adapter on a public origin.

## Useful URLs

- `/` — staff command center
- `/appointments` — schedule and check-in
- `/queue` — queue and consultation actions
- `/follow-ups` — retention worklist and rebooking
- `/book` — patient booking
- `/api/health` — database health

## Resetting local data

Use a fresh Wrangler local-state directory or intentionally remove only `.wrangler/state` after confirming it is the repository-local generated state. Reapply migrations afterward. Do not delete workspace or user directories.
