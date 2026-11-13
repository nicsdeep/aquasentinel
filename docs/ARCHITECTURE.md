# Architecture

## Principles
- **One source of truth per concern.** GitHub holds all code *and* all database schema (as SQL migrations).
  Supabase holds all application data. Vercel only runs builds produced from GitHub commits.
- **Device-independent development.** All work happens in Claude Code cloud sessions attached to this repository,
  so a task started on a phone can be continued on a laptop: state lives in Git branches and pull requests, not on a machine.
- **Production is never changed by hand.** Only the Release workflow, after the owner's approval, migrates the
  production database and deploys production.

## Delivery pipeline
```
Prompt (phone / laptop / desktop)
  → Claude Code cloud session (branch claude/<task>)
  → pull request → CI (lint, types, unit, build, smoke, migration replay, RLS check, advisors)
  → owner merges to main (GitHub web or Mobile)
  → Release workflow
       development:  migrate dev DB → deploy Vercel preview → verify /api/health (commit SHA + Supabase)
       production:   ⏸ owner approves in GitHub Mobile → migrate prod DB → deploy Vercel production → verify live URL
  → task report: commit, migration status, deployment status, live URL
```

## Environments
| | Local | Development | Production |
|---|---|---|---|
| App | `npm run dev` | Vercel *Preview* deployments | Vercel *Production* |
| Database | Local Supabase in Docker | Supabase project `aquasentinel-dev` | Supabase project `aquasentinel-prod` |
| Migrations applied by | developer / Claude | Release workflow (automatic on `main`) | Release workflow (after approval) |
| Data | Disposable | Test / SIMULATED only | Real (only after Gate D security review) |

Pull-request preview deployments (built by Vercel's GitHub integration) use the development database. Migrations
reach development only after merge, so previews of PRs that change the schema can fail until merged — by design,
to keep unreviewed SQL out of shared databases.

## Application layout
```
src/app/            Next.js routes (App Router). /api/health is the deployment verification endpoint.
src/lib/env.ts      The only place that reads environment variables.
src/lib/supabase/   Browser and server Supabase clients (publishable key + user session; RLS applies).
supabase/           Supabase CLI config, migrations/ (immutable history), seed.sql (local only).
scripts/            CI guards: migration history checks and the RLS check.
tests/unit/         Vitest unit tests.     tests/smoke/  Playwright smoke tests (local and deployed).
```

## Planned product modules (from PROJECT_RULES §3, not yet built)
Identity & Access · Sites & Assets · Device Ingestion · Sensor Readings · Rules & Alerts · Incident & Maintenance ·
SMS Communications · Dashboard · Reporting & Evaluation · Audit & Administration — all on the single Supabase backend.
Devices will use an authenticated, rate-limited ingestion API (Edge Function), never database credentials.
