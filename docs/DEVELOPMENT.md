# Development standards

## Daily workflow
1. Start a Claude Code session with `nicsdeep/aquasentinel` selected (web, desktop or mobile — all identical).
2. Each task gets a branch `claude/<short-task-name>` from the latest `main` and one focused PR.
3. Before pushing: `npm run check` and `npm run build`; for UI work also `npm run test:smoke`.
4. Parallel sessions are fine: each works on its own branch. The "up to date" rule and migration-order check stop
   conflicting merges; rebase on `main` and regenerate a migration timestamp if CI says so.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run check` | Lint + typecheck + unit tests |
| `npm run build` | Production build |
| `npm run test:smoke` | Playwright smoke tests (desktop + mobile) against `next start` or `BASE_URL` |
| `npx supabase db start` | Local Postgres with all migrations applied (needs Docker) |
| `npx supabase migration new <name>` | Create a new timestamped migration |
| `npx supabase db reset` | Rebuild the local database from migrations (+ local seed) |
| `npm run db:check-rls` | Fail if any `public` table lacks RLS (local DB) |
| `npm run db:check-destructive` | Fail if new migrations contain unmarked destructive SQL |
| `npm run db:check-migrations` | Validate migration names, immutability and order against `origin/main` |

**Claude cloud containers:** start Docker with `dockerd > /tmp/dockerd.log 2>&1 &` if `docker ps` fails, and run smoke
tests with `PW_CHROMIUM_PATH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome | head -1) npm run test:smoke`.

## Database migration rules
- One migration per logical change; descriptive snake_case names.
- Never edit, rename or delete a migration that is on `main`.
- Production migrates automatically: avoid destructive SQL; mark unavoidable cases with `-- allow-destructive: <reason>`
  only after the owner confirms.
- Backward compatible with the deployed app: add columns/tables first, switch the app, remove old structures in a later
  release (expand → migrate → contract).
- New `public` tables: `enable row level security` + explicit policies in the same file. Default to deny.
- Seed data (`supabase/seed.sql`) is for local use only and must be marked SIMULATED.

## Code standards
- TypeScript strict mode; no `any` without a comment explaining why.
- Read environment variables only via `src/lib/env.ts`.
- Descriptive names, small modules, shared domain logic (no duplicated business rules across interfaces).
- Accessibility and mobile are acceptance criteria, not polish (PROJECT_RULES §6).
- Tests accompany logic changes; bug fixes include a regression test where practical.

## Commits and pull requests
- Commit messages: imperative summary line (≤ 72 chars), body explaining why when not obvious.
- PRs use the template and state database impact, verification and risks.
