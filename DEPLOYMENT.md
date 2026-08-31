# Deployment

## Build

```bash
npm ci
npx tsc --noEmit
npm run lint
npm test
```

The supported production compiler is `vinext build`; raw `next build` cannot resolve Cloudflare’s runtime-only `cloudflare:workers` module during Node page-data collection.

## Sites resources

`.openai/hosting.json` declares logical bindings:

- `DB` — Cloudflare D1
- `FILES` — Cloudflare R2, reserved until the private file workflow is implemented

Sites owns remote resource creation and injection. Do not commit provider secrets or physical resource IDs.

Production migrations contain only tenant, location, staff/RBAC, service, and
message-template reference data. Synthetic patients and care-state fixtures live
in `db/seeds/development.sql`; apply that file only to a disposable local D1
database after all migrations. Never pass `--remote` when running the development
seed.

## Release policy

Deploy this release as **owner-only/private preview**. Do not expose it publicly until every launch gate in `SECURITY.md` is closed. In particular, the current staff adapter and plaintext preview data are incompatible with a public healthcare workload.

Keep `NEXT_PUBLIC_ALLOW_INDEXING=false` for every private preview. Changing it to
`true` only changes crawler directives and sitemap generation; it does not make
the app safe for public access and must never be treated as authorization.

The legacy GitHub Pages workflow is verification-only and no longer uploads or
deploys a public artifact. Repository owners must also disable any already-live
Pages site in GitHub **Settings → Pages** and invalidate any cached/public demo
URL; workflow changes do not remove an artifact that was published previously.

Before each release:

1. inspect migrations and confirm no development patient fixtures will enter production;
2. run build, lint, types, tests, and dependency review;
3. verify auth/access policy and environment values;
4. apply migrations with backup/rollback planning;
5. smoke-test health, booking conflict, queue, and follow-up flow;
6. record version, approver, data migration, and recovery plan;
7. monitor errors and latency, then perform a restore drill on schedule.
