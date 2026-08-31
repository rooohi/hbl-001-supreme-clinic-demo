# Architecture

## Runtime

The preview is a Next.js 16 / React 19 application compiled by vinext to Cloudflare Worker-compatible ESM. The app uses React Server Components, client features powered by TanStack Query, React Hook Form and Zod, D1 for structured state, and a declared R2 binding reserved for future private files.

```text
Patient / Staff UI
        |
Next App Router + route handlers
        |
Staff context | Scheduling | Queue | Follow-up services
        |
Cloudflare D1 (preview)     R2 (declared, workflow not implemented)
```

## Boundaries

- `app/` routes and APIs compose requests and responses.
- `features/` contains bounded user workflows.
- `server/` owns tenant context, validation, scheduling, and wait arithmetic.
- `db/` owns Drizzle schema and binding access.
- `drizzle/` contains deployable migrations.
- `types/` contains shared API contracts and generated Cloudflare types.

## Tenancy

Every operational query derives the preview tenant and location from server context; clients do not supply a trusted tenant ID. This is a foundation, not complete multi-tenant authorization. Production must resolve an authenticated subject to active memberships, roles, location scope, and assigned-patient rules, then enforce composite tenant foreign keys.

## Scheduling

Appointments create a reservation and one unique claim per five-minute provider bucket. Database primary-key conflicts are the final overlap guard. Idempotency keys make client retries safe. Public writes revalidate service visibility, Sunday closure, 11:00–18:00 hours, the 180-day horizon, and 20-minute start alignment.

## Queue

One queue is created per tenant/location/provider/local date. States use explicit transition maps. Wait estimates use current consultation remaining time, called-before-waiting ordering, sequence order, and bounded configured durations. They are labelled deterministic and never presented as AI.

## Production database target

The original product brief requests PostgreSQL. Hosted Sites uses D1 without raw TCP access, so this preview uses D1 as a deployable platform adapter. Before a public production launch, either migrate the canonical repositories to PostgreSQL over an approved HTTP/serverless driver or formally approve a hardened D1 architecture after scale, integrity, backup, and residency review.
