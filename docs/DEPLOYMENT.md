# Deployment: one-time setup and day-to-day releases

Everything here is done by the owner in a browser (desktop or phone). **Never paste a secret into a Claude chat** —
secrets go only into the GitHub and Vercel screens named below.

The pipeline is **continuous deployment**: every change that passes CI is merged and goes straight to production,
with no approval step (owner's decision; see docs/ARCHITECTURE.md "Safety net").

---

## Part 1 — Supabase (production project `wkebtafpbcgotlwqpnqn`) ✅ exists
1. Use a long database password (Database → Settings). Rotate it, and the **secret key** (Settings → API Keys),
   periodically and immediately if either is ever exposed; then update `SUPABASE_DB_URL` in GitHub.
2. Open **Connect** (top bar) → **Session pooler** and copy the URI, replacing `[YOUR-PASSWORD]` with the new password:
   `postgresql://postgres.wkebtafpbcgotlwqpnqn:<password>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`.
   This is `SUPABASE_DB_URL`. Use the session pooler, not the direct connection: GitHub runners need IPv4.

## Part 2 — Vercel (project `aquasense`, live at `https://ifsl.vercel.app`) ✅ imported
1. **Settings → Environment Variables**: keep only the three `NEXT_PUBLIC_*` variables (docs/ENVIRONMENTS.md).
   Remove any database URL, password or secret key.
2. Project **Settings → General**: copy **Project ID** → `VERCEL_PROJECT_ID`.
   Account/team **Settings → General**: copy the **Team ID** (or user ID for a personal account) → `VERCEL_ORG_ID`.
3. **Account Settings → Tokens → Create**: name `github-actions-aquasentinel`, scope = your account/team,
   expiration 1 year (calendar reminder to renew) → `VERCEL_TOKEN`.
4. Enable **two-factor authentication** on the Vercel account.

## Part 3 — GitHub repository settings (`nicsdeep/aquasentinel` → Settings)
On GitHub Free, rulesets and environment secrets only work on **public** repositories, so this repo is public
(the alternative is GitHub Pro). Never commit secrets. Also set:
- **Actions → General → Fork pull request workflows** → **Require approval for all external contributors**.
- **Advanced Security** → enable **Secret Protection / Push protection**.
- Vercel → Project → Settings → Git → keep **Git Fork Protection** on.

1. **General → Pull Requests**: tick **Allow auto-merge** and **Automatically delete head branches**.
2. **Actions → General → Workflow permissions**: **Read repository contents and packages permissions**; leave
   **Allow GitHub Actions to create and approve pull requests** unticked. Save.
3. **Environments → New environment** `production`:
   - No required reviewers (continuous deployment).
   - Deployment branches and tags → **Selected branches and tags** → add `main`.
   - Secrets: `SUPABASE_DB_URL`, `VERCEL_TOKEN`. Variable: `PRODUCTION_URL` = `https://ifsl.vercel.app`.
4. **Secrets and variables → Actions → Variables (Repository)**: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
5. **Rules → Rulesets → New branch ruleset**, name `protect-main`, Enforcement **Active**, target **Default branch**:
   - ✅ Restrict deletions · ✅ Block force pushes
   - ✅ Require a pull request before merging (required approvals: **0**)
   - ✅ Require status checks to pass · ✅ Require branches to be up to date — add
     `App · lint, types, tests, build, smoke` and `Database · migration history, replay, RLS, advisors`
   - Bypass list: empty.
   This ruleset is what makes merging safe without a human: nothing reaches `main` (and therefore production)
   unless both checks passed.
6. Finally, **Variables (Repository)** → `PIPELINE_ENABLED` = `true`. The next merge to `main` releases to production.

---

## Day-to-day release flow
1. Ask Claude for a change from any device.
2. Claude works on `claude/<task>`, opens a PR and waits for CI.
3. CI green → Claude merges. Red → Claude fixes it; nothing is deployed.
4. The **Release** workflow runs CI again, migrates production, deploys to Vercel and verifies the live URL.
5. Claude reports the commit, migration status, deployment status and live URL. The run's **Summary** page in
   GitHub Actions shows the same.

## If something fails
- **CI fails:** nothing merges or deploys.
- **Production migration fails:** each migration runs in a transaction and the app is not deployed. Fix forward.
- **Deploy or verification fails after migrating:** the previous app version keeps serving (migrations are backward
  compatible by rule). Roll back the app instantly in Vercel → Deployments → previous deployment → **Promote**.
- **Need a database rollback:** write a new corrective migration. The free plan has limited backups, so avoid
  destructive changes; consider Supabase Pro (point-in-time recovery) before storing real field data.
- Never "fix" production by editing the database in the Supabase dashboard; always add a migration.
