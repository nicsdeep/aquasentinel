# Architecture

## Principles
- **One source of truth per concern.** GitHub holds all code *and* all database schema (as SQL migrations).
  Supabase holds all application data. Vercel only runs builds produced from GitHub commits.
- **Device-independent development.** All work happens in Claude Code cloud sessions attached to this repository,
  so a task started on a phone can be continued on a laptop: state lives in Git branches and pull requests, not on a machine.
- **Production is never changed by hand.** Only the Release workflow migrates the production database and deploys
  production, and only for commits that passed CI.
- **Continuous deployment.** The owner develops alone and chose not to approve each release (decision of 13 Nov 2026).
  Automated checks replace the manual gate (see "Safety net" below).

## Delivery pipeline
```
Prompt (phone / laptop / desktop)
  → Claude Code cloud session (branch claude/<task>)
  → pull request → CI (lint, types, unit, build, smoke, migration history, destructive-SQL guard,
                       migration replay on a throwaway DB, RLS check, security advisors)
  → CI green → Claude merges to main
  → Release workflow: CI again on the merge commit
       → migrate production DB → deploy Vercel production → verify /api/health (commit SHA + Supabase)
  → task report: commit, migration status, deployment status, live URL
```

## Safety net (replaces manual approval)
| Risk | Control |
|---|---|
| Broken code reaches users | CI must pass on the PR and again on `main`; smoke tests verify the live URL after deploy |
| Untracked or conflicting schema changes | Migrations only via Git; history must be immutable and in order; `db push` refuses drift |
| Data loss from a migration | Destructive SQL blocked unless explicitly marked with a reason the owner confirmed |
| Data exposed without RLS | CI fails if any `public` table lacks RLS; Supabase security advisors run in CI and on release |
| Deploy reported as successful when it isn't | Release succeeds only if the public URL serves the new commit SHA with Supabase reachable |
| Bad release | Vercel → Deployments → **Promote** the previous deployment (instant app rollback); fix forward for the DB |

## Environments
| | Local | Production |
|---|---|---|
| App | `npm run dev` | Vercel *Production* — `https://ifsl.vercel.app` |
| Database | Local Supabase in Docker (also used by CI) | Supabase project `wkebtafpbcgotlwqpnqn` (eu-west-3) |
| Migrations applied by | developer / Claude | Release workflow, automatically on `main` |
| Data | Disposable / SIMULATED | Real (only after the Gate D security review) |

There is no shared development environment. Every change is tested on a fresh local database in CI before it can
merge. Vercel's pull-request preview deployments use the Preview variables; until a dev database exists, keep
Preview pointed at production only while the database holds no real data.

## Application layout
```
src/app/            Next.js routes (App Router). /api/health is the deployment verification endpoint.
src/lib/env.ts      The only place that reads environment variables.
src/lib/supabase/   Browser and server Supabase clients (publishable key + user session; RLS applies).
supabase/           Supabase CLI config, migrations/ (immutable history), seed.sql (local only).
scripts/            CI guards: migration history, destructive SQL, RLS.
tests/unit/         Vitest unit tests.     tests/smoke/  Playwright smoke tests (local and deployed).
```

## Planned product modules (from PROJECT_RULES §3, not yet built)
Identity & Access · Sites & Assets · Device Ingestion · Sensor Readings · Rules & Alerts · Incident & Maintenance ·
SMS Communications · Dashboard · Reporting & Evaluation · Audit & Administration — all on the single Supabase backend.
Devices will use an authenticated, rate-limited ingestion API (Edge Function), never database credentials.
