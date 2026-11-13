# Deployment: one-time setup and day-to-day releases

Do the parts in order. Everything here is done by the owner in a browser (desktop or phone). **Never paste any
secret into a Claude chat** — secrets go only into the GitHub and Vercel screens named below.

---

## Part 1 — Supabase (two projects)
1. In your personal Supabase organisation create two projects in the **same region**:
   `aquasentinel-dev` and `aquasentinel-prod`. Use a long **letters-and-digits-only** database password
   (special characters break connection strings). Store both passwords in your password manager.
2. For each project, open **Connect** (top bar) → **Session pooler** and copy the URI. It looks like
   `postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-<n>-<region>.pooler.supabase.com:5432/postgres`.
   Replace `[YOUR-PASSWORD]` with that project's password. This is that project's `SUPABASE_DB_URL` (a secret).
   Use the *session pooler*, not the direct connection: GitHub runners need its IPv4 address.
3. For each project, note from **Settings → API Keys**: the project URL `https://<ref>.supabase.co` and the
   **publishable** key. (Not secret.)

## Part 2 — Vercel
1. Sign in to Vercel with GitHub (`nicsdeep`). **Add New → Project → Import** `nicsdeep/aquasentinel`. When asked to
   install the Vercel GitHub App, choose **Only select repositories → aquasentinel**.
2. Before clicking Deploy, open **Environment Variables** and add (see docs/ENVIRONMENTS.md):
   - Environment **Production**: `NEXT_PUBLIC_APP_ENV=production`, `NEXT_PUBLIC_SUPABASE_URL` and
     `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` of **aquasentinel-prod**.
   - Environment **Preview**: `NEXT_PUBLIC_APP_ENV=development`, URL and publishable key of **aquasentinel-dev**.
   Then Deploy. Note the production domain (e.g. `https://aquasentinel.vercel.app`) → `PRODUCTION_URL`.
3. Project **Settings → General**: copy **Project ID** → `VERCEL_PROJECT_ID`.
   Team/account **Settings → General**: copy the **Team ID** (or user ID for a personal account) → `VERCEL_ORG_ID`.
4. Project **Settings → Deployment Protection → Protection Bypass for Automation → Add** → copy the value →
   `VERCEL_AUTOMATION_BYPASS_SECRET`.
5. **Account Settings → Tokens → Create**: name `github-actions-aquasentinel`, scope = your team/account,
   expiration 1 year (add a calendar reminder) → `VERCEL_TOKEN`.

## Part 3 — GitHub repository settings (`nicsdeep/aquasentinel` → Settings)
1. **Actions → General → Workflow permissions**: select **Read repository contents and packages permissions**, and
   leave **Allow GitHub Actions to create and approve pull requests** unticked. Save.
2. **Environments → New environment** `development`:
   - Deployment branches and tags → **Selected branches and tags** → add `main`.
   - Secrets: `SUPABASE_DB_URL` (dev), `VERCEL_TOKEN`, `VERCEL_AUTOMATION_BYPASS_SECRET`.
3. **Environments → New environment** `production`:
   - **Required reviewers** → add `nicsdeep`. Leave **Prevent self-review** unticked (you are the only reviewer).
   - Deployment branches and tags → **Selected branches and tags** → add `main`.
   - Secrets: `SUPABASE_DB_URL` (prod), `VERCEL_TOKEN`. Variable: `PRODUCTION_URL`.
4. **Secrets and variables → Actions → Variables (Repository)**: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
5. **Rules → Rulesets → New branch ruleset**, name `protect-main`, Enforcement **Active**, target **Default branch**:
   - ✅ Restrict deletions · ✅ Block force pushes
   - ✅ Require a pull request before merging (required approvals: **0** — GitHub does not let you approve your own
     PR; your merge is the review, and production has its own approval gate)
   - ✅ Require status checks to pass · ✅ Require branches to be up to date — add the checks
     `App · lint, types, tests, build, smoke` and `Database · migration history, replay, RLS, advisors`
     (they appear in the list after CI has run once on a pull request)
   - Bypass list: empty.
6. Finally, **Variables (Repository)** → add `PIPELINE_ENABLED` = `true`. The next push to `main` runs the full release.

## Part 4 — Your phone
Install **GitHub Mobile**, sign in as `nicsdeep`, and enable notifications for *Pull requests* and *Deployment reviews*
(Profile → Settings → Notifications).

---

## Day-to-day release flow
1. Ask Claude for a change (any device). Claude works on `claude/<task>`, opens a PR and reports CI results.
2. Review the PR and **merge** it (GitHub web or Mobile).
3. The **Release** workflow runs: CI again → development migrate/deploy/verify.
4. GitHub Mobile notifies you: **Review pending deployments → production → Approve** (or Reject).
5. Production migrates, deploys and is verified on `PRODUCTION_URL`. The run's **Summary** page lists the commit,
   migration status and URLs; Claude includes the same in its task report.

## If something fails
- **CI fails on a PR:** nothing is deployed. Claude fixes it on the same branch.
- **Development step fails:** production is never reached. Fix forward with a new PR.
- **Production migration fails:** Postgres applies each migration in a transaction; the app is not deployed. Fix forward.
- **Production deploy or verification fails after migrating:** the previous app version keeps serving (migrations are
  backward compatible by rule). In Vercel → Deployments you can **Promote** the previous deployment to roll back the app.
- Never "fix" production by editing the database in the Supabase dashboard; always add a migration.
