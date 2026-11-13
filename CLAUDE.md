# AquaSentinel — instructions for Claude

@AGENTS.md

AquaSentinel is a community water-system monitoring and maintenance platform (Ngomano, Makueni).
**`docs/PROJECT_RULES.md` is the governing requirements document. Read it before any product work and never
silently bypass it.** Product features are built only from requirements the owner (Nicholas Kioko, GitHub `nicsdeep`)
has supplied or approved.

## Stack
- Next.js (App Router) + TypeScript, responsive web/PWA — `src/`
- Supabase (Postgres, Auth, RLS, Edge Functions) — `supabase/`
- Vercel hosting; GitHub Actions CI/CD — `.github/workflows/`
- Node 22 (`.nvmrc`). This Next.js version has breaking changes: check `node_modules/next/dist/docs/` before writing Next code.

## Workflow for every task
1. Work on a branch named `claude/<short-task-name>` created from up-to-date `main`. Never commit to `main` directly.
2. Keep changes focused. No business features without owner-supplied requirements.
3. Before pushing run `npm run check` (lint + typecheck + unit tests) and `npm run build`. For UI changes also run
   `npm run test:smoke` (in cloud containers set `PW_CHROMIUM_PATH` to the preinstalled Chromium, see docs/DEVELOPMENT.md).
4. Database changes: `npx supabase migration new <snake_case_name>`, write SQL there, and validate locally
   (`npx supabase db start` / `npx supabase db reset`, then `npm run db:check-rls`). Docker may need starting with `dockerd &`.
5. Push the branch and open a PR to `main` using the PR template. Watch CI and fix failures.
6. The owner merges and approves production from GitHub. Never merge your own PR unless the owner explicitly asks.

## Hard rules
- **Never touch hosted Supabase or Vercel directly.** No Supabase/Vercel tokens in Claude sessions. All hosted
  migrations and deployments run through `.github/workflows/release.yml`. The Supabase connector in Claude
  belongs to a different (ShiftNex) account — never use it for AquaSentinel.
- **Migrations are immutable** once on `main`: never edit, rename or delete them; add a new one. Every new table
  in `public` must `enable row level security` and have policies in the same migration (CI enforces this).
- Migrations must be backward compatible with the currently deployed app (expand → migrate → contract),
  because production migrates before the new app version goes live.
- Never commit secrets. Never put secret keys in `NEXT_PUBLIC_*` variables, client code, firmware or docs.
- Read configuration through `src/lib/env.ts` only, and document new variables in `.env.example` and `docs/ENVIRONMENTS.md`.
- Mark all demo/mock data and simulated SMS **SIMULATED**. Never claim real deployments, partners or measured impact.
- Do not access Lovable, ShiftNex or any unrelated project/account for AquaSentinel work.

## Reporting — required at the end of every completed task
Report all of these, verified, never assumed:
- **Branch / PR:** link, and commit SHA(s)
- **CI:** passed / failed (with the failing check)
- **Database:** migrations added (file names) and status on development / production (from the Release run summary)
- **Deployment:** development URL and production status (waiting for approval / deployed / failed)
- **Live URL:** only reported as live after `/api/health` returns the expected `commitSha`

If something could not be verified (e.g. no access to Actions results), say so explicitly.
