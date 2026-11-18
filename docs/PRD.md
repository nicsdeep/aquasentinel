# AquaSentinel product requirements document (living)

**Every agent reads this file before starting work and updates it in the same pull request as every change.**
Rules for how to work are in [`AGENT_RULES.md`](AGENT_RULES.md) (portable) and [`../CLAUDE.md`](../CLAUDE.md)
(project). Governing requirements remain [`PROJECT_RULES.md`](PROJECT_RULES.md); design in
[`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md); method in [`PRODUCT_DOCTRINE.md`](PRODUCT_DOCTRINE.md).

Last updated: 18 November 2026.

## 1. Product
AquaSentinel is a community water-system monitoring and maintenance platform for Ngomano, Makueni (KRCS/ICHA IFSL
Digital Innovation Challenge). It **improves and maintains existing water systems**: it watches the system, warns
early and helps local people respond and repair. It never replaces the system and never controls a pump.

- Owner: Nicholas Kioko (GitHub `nicsdeep`), solo team. Final pitch: 26 November 2026.
- Production: https://ifsl.vercel.app. Repository: `nicsdeep/aquasentinel` (public: no secrets, no unrelated
  project names).
- Stack: Next.js (App Router) + TypeScript, Tailwind, Supabase (Postgres, Auth, RLS, Realtime), Vercel, GitHub Actions.

## 2. Owner decisions in force
| Date | Decision |
|---|---|
| 13 Nov 2026 | Continuous deployment: agent merges after green CI; merging to `main` deploys. No data-deleting demo reset. |
| 14 Nov 2026 | "Always make it live." Production-realistic presentation; demo environment identified once, in the account menu; SMS "Delivered" only when a real provider confirms. |
| 14 Nov 2026 | Logo kit in `public/brand/` is the approved logo; Logo2 (white wordmark) for dark backgrounds; accents aligned to the logo; orange is the one primary action per screen. |
| 16 Nov 2026 | Design lock: approved layout, colours (water theme), typography, imagery placement and navigation change only on explicit request. |
| 16 Nov 2026 | Owner screenshots come from the live site via `scripts/live-screenshots.cjs` (phone 360×800 @2.5, laptop 1440×900). |
| 18 Nov 2026 | Signed-in app restarts from zero, one dashboard at a time; Operator Home is next. Sign-in is invite-only email one-time code; mobile-number codes later (needs an SMS provider). |
| 18 Nov 2026 | Permanent agent rules (`AGENT_RULES.md`): no hallucination, no regressions, design lock, ~3 screenshot options before any UI change, views over new tables, no Edge Functions, no legacy code, realtime UI with no page reload, PRD updated with every change. "Always make it live" applies **after** the owner picks an option. |

## 3. Current live state
**Public website** (route group `(site)`, shared header with menu drawer and footer):
- `/` homepage (gateway): headline, "See How It Works" / "Explore the Challenge", 3D swipe deck of six
  illustrative photos (`public/landing/deck/`), aqua wave, navy pilot strip. Text never overlaps imagery.
- `/challenge`, `/approach`, `/pilot`, `/about`, `/contact` (content in `src/lib/site/content.ts`, IFSL §3.2 facts).

**Trust & legal** (English + Kiswahili, `src/lib/legal/content.ts`): `/legal`, `/privacy`, `/terms`, `/cookies`,
`/security`. Public for visitors; inside the app shell for signed-in users.

**Sign-in** `/sign-in`: email + 6-digit one-time code (Supabase Auth OTP, `shouldCreateUser: false`); mobile tab
shows "coming soon". Email template: `supabase/templates/magic_link.html`.

**Signed-in app** (route group `(app)`): `/dashboard` shows a welcome placeholder ("Your Operator Home is being
built"). Shell: logo, Main → Home, Programme → Trust & legal, site chip, account/environment menu.

**Parked (not routed, kept for reuse)** in `src/_parked/` (excluded from build/lint): old Site, Tasks, Brief,
Incidents and dashboard screens. `/site`, `/tasks`, `/brief`, `/incidents/*` redirect to `/`.

## 4. Design system (locked)
Water colour theme; tokens are defined in `src/app/globals.css` and documented in `DESIGN_SYSTEM.md`.
- Public site `lp-*`: ink #0c1a3a, navy #0a3a6c, body #3e4f69, blue #015a86, blue-deep #01426f, cyan #08a8cd,
  band #f7fafb, pill #e2f3f9, wave #c7eaf6. Headings Instrument Serif (`.lp-heading`), body Geist.
- App: canvas #f5fbfa, line #dce8e6, teal #00afce, teal-strong #0093ae, accent #00738c, navy #003a72,
  orange #fb4803 (one primary action per screen only). Status colours always paired with an icon and a word.

## 5. Data model (reuse before adding)
- **Tables (10):** `alert_rules`, `assets`, `audit_log`, `devices`, `incidents`, `profiles`, `readings`,
  `site_members`, `sites`, `sms_messages`. RLS on all; writes through SECURITY DEFINER functions.
- **Views (7):** `device_health`, `device_uptime_24h`, `incident_timeline`, `kpi_summary`, `latest_readings`,
  `maintenance_history`, `site_status`. New read needs are met with views first.
- **Edge Functions:** none (`supabase/functions` does not exist). Time-based checks use `pg_cron`.
- **Realtime:** publication `supabase_realtime` covers `incidents`, `sms_messages`, `audit_log`, `readings`
  (`supabase/migrations/20261113100100_workflow.sql`). The client subscribes per site in
  `src/lib/data/site-data.tsx` and refetches in place; a 60 s poll is only a safety net.

## 6. Build roadmap (one screen per PR; owner picks one of ~3 screenshot options first)
1. **Operator Home** (next): "Is my water OK and what must I do now?" Status in words, active alert with who is
   responsible, one next action, live via realtime.
2. Alert / incident detail.
3. Technician jobs.
4. Site readings.
5. Committee reports.
6. Admin and user management.

## 7. Open owner actions
- Supabase Auth: invite own email; paste the Magic Link template; connect SMTP (e.g. Resend) and name the provider
  so it is added to the Privacy Notice and `DATA_PROTECTION_POLICY.md`. SMS provider later for mobile codes.
- Rotate the Supabase DB password and secret key exposed earlier.
- Create and monitor `info@aquasentinel.com`.
- Retention is applied manually; an automated job is due before the pilot.

## 8. Changelog (newest first; add one row per merged PR)
| Date | PR | Change |
|---|---|---|
| 18 Nov 2026 | (this PR) | Added `docs/PRD.md` and portable `docs/AGENT_RULES.md`; `CLAUDE.md` loads both before every task. |
| 18 Nov 2026 | #32 | Old app screens parked; email OTP sign-in; welcome placeholder. |
| 16 Nov 2026 | #31 | Live screenshot tool and rule. |
| 16 Nov 2026 | #30 | Design-lock rule. |
| 16 Nov 2026 | #29 | Homepage 3D swipe deck; text never overlaps imagery. |
| 16 Nov 2026 | #28 | Mobile: four destinations moved into the menu. |
| 16 Nov 2026 | #27 | Homepage gateway; dedicated public pages. |
| 16 Nov 2026 | #26 | Homepage to the approved brief. |
| 16 Nov 2026 | #25 | Public website at `/`; sign-in moved to `/sign-in`. |
| 16 Nov 2026 | #22–#24 | Trust & legal centre (EN + SW), inside the app shell when signed in. |
| 13–14 Nov 2026 | #18–#21 | Logo kit, water background, Home rebuild, clean workspace. |
