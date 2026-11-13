# AquaSentinel — instructions for Claude

@AGENTS.md

AquaSentinel is a community water-system monitoring and maintenance platform (Ngomano, Makueni).
**`docs/PROJECT_RULES.md` is the governing requirements document. Read it before any product work and never
silently bypass it.** Every screen and workflow also follows `docs/PRODUCT_DOCTRINE.md` (principles, five-step
method, acceptance criteria) and `docs/DESIGN_SYSTEM.md` (tokens, type, CTA ladder: one orange primary per screen). Product features are built only from requirements the owner (Nicholas Kioko, GitHub `nicsdeep`)
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
6. **Continuous deployment (owner's decision, 13 Nov 2026):** the owner works alone and does not review each change.
   Once CI is green on the PR's latest commit, Claude merges it (enable auto-merge via
   `PUT /repos/nicsdeep/aquasentinel/pulls/<n>/ccr/auto_merge`, or merge with the REST merge endpoint after confirming
   every check passed). Merging to `main` deploys to production automatically. Never merge with failing or pending checks,
   never bypass the ruleset, and stop and ask the owner first for anything destructive, security-sensitive or irreversible.
7. After the merge, watch the Release run and verify the live URL before reporting.
8. To undo or delete anything (code, deployment, tables, data), follow docs/DEPLOYMENT.md → "Undo, revert and delete".

## Hard rules
- **Never touch hosted Supabase or Vercel directly.** No Supabase/Vercel tokens in Claude sessions. All hosted
  migrations and deployments run through `.github/workflows/release.yml`. The Supabase connector in Claude
  belongs to a different (ShiftNex) account — never use it for AquaSentinel.
- **Migrations are immutable** once on `main`: never edit, rename or delete them; add a new one. Every new table
  in `public` must `enable row level security` and have policies in the same migration (CI enforces this).
- Migrations must be backward compatible with the currently deployed app (expand → migrate → contract),
  because production migrates before the new app version goes live.
- Production migrates automatically with no human approval. Avoid destructive SQL (drop, truncate, delete, column type
  changes). CI blocks it unless the file has `-- allow-destructive: <reason>`; add that marker only after the owner
  confirms in chat that the data loss is intended.
- Never commit secrets. Never put secret keys in `NEXT_PUBLIC_*` variables, client code, firmware or docs.
- Read configuration through `src/lib/env.ts` only, and document new variables in `.env.example` and `docs/ENVIRONMENTS.md`.
- **Presentation (owner decision, 14 Nov 2026; exception to PROJECT_RULES §8):** production-realistic UI with no
  DEMO/VIRTUAL/SIMULATED/TEST labels on cards, charts, sensor names, alerts or SMS. The demonstration environment is
  identified **once**, in the account/environment menu. Honesty is preserved by behaviour: each reading keeps its
  source (`readings.source`; shown via "Inspect data source" on the Site page), and SMS show "Delivered" **only**
  when a real provider confirms delivery (demo gateway messages are "Sent"). The /brief page keeps its data-source
  note. Never claim field telemetry, real deployments, partners or measured impact. Every button must work.
- Do not access Lovable, ShiftNex or any unrelated project/account for AquaSentinel work.

## Reporting — required at the end of every completed task
Report all of these, verified, never assumed:
- **Branch / PR:** link, and commit SHA(s)
- **CI:** passed / failed (with the failing check)
- **Database:** migrations added (file names) and production status (from the Release run summary)
- **Deployment:** production status (deployed / failed, with the failing step)
- **Live URL:** only reported as live after `/api/health` returns the expected `commitSha`

If something could not be verified (e.g. no access to Actions results), say so explicitly.
