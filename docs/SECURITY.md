# Security baseline

This document records the infrastructure-level controls. Product-level controls (roles, device identity, SMS
verification, Kenya Data Protection Act documentation) are specified in docs/PROJECT_RULES.md §4 and will be added
here as they are built. A documented security/privacy review is required before field deployment (Gate D).

## Secrets
| Secret | Stored in | Never in |
|---|---|---|
| Supabase database URL (contains the DB password) | GitHub Environment secret (`production`) | Code, chat, Vercel, Claude sessions |
| Supabase secret key `sb_secret_…` | Not used yet; future server-only Vercel variable | Browser code, `NEXT_PUBLIC_*`, firmware |
| Vercel token | GitHub Environment secret | Code, chat |
| Publishable key `sb_publishable_…` | Vercel env vars (public by design) | — safe only because RLS is enforced |

- Production secrets exist only in the `production` environment, usable only by workflows running on `main`.
  `main` accepts changes only through PRs whose CI passed (ruleset `protect-main`).
- The pipeline uses a **project-scoped** database URL, not an account-wide Supabase access token.
- **Continuous deployment:** there is no manual approval before production (owner's decision, 13 Nov 2026).
  Compensating controls: required CI, destructive-SQL guard, RLS check, security advisors, post-deploy verification.
- Claude Code sessions hold no Supabase or Vercel credentials. The Supabase connector visible in Claude belongs to
  another organisation's account and is not used for AquaSentinel.
- 13 Nov 2026: the production DB password and secret key were shared in a chat; they must be rotated.
- Rotate the Vercel token yearly and any secret immediately if exposed (screenshot, chat, log).

## Database
- Migrations with destructive SQL (drop, truncate, delete, column type change) fail CI unless the file carries
  `-- allow-destructive: <reason>`, added only after the owner confirms the data loss is intended.
- Every table in `public` must have Row Level Security enabled, with policies, in the same migration that creates it.
  CI (`scripts/check-rls.sql`) blocks merges otherwise, and Supabase security advisors run in CI and on every release.
- Schema changes only via reviewed migrations. Dashboard edits to hosted schemas are prohibited.
- The browser and server app use the publishable key plus the user's session, so every query is subject to RLS.

## Code and supply chain
- `main` is protected: PRs only, required checks, no force pushes or deletions.
- GitHub Actions run with a read-only token by default and cannot approve PRs.
- Dependabot opens weekly update PRs for npm packages and GitHub Actions; they pass the same CI.
- Known: `npm audit` currently reports moderate advisories in ESLint's TypeScript tooling (development-only, not shipped).
