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
| 19 Nov 2026 | Simulation uses the owner's photos (photo chain, Option A), captioned with each real place, owner confirms permission. Logos/signage photos, screenshots and watermarked images excluded; faces blurred. Simulation shared live across pages and devices via a Realtime broadcast (no storage). |
| 18 Nov 2026 | Live water-flow simulation at `/demo/water-flow`, linked from the homepage. Frontend only; never touches equipment or production data. In automatic mode **AquaSentinel requests and the local controller acts** (operator confirms or auto-confirm), so "never controls pumps" stays true. Built directly without an options round (owner's explicit instruction). |
| 18 Nov 2026 | Trust & legal pages simplified for judges: small centred page, summary rows with the full text on tap, one button (Email us) (Option A). Legal text unchanged. |
| 18 Nov 2026 | Same light water theme on every device; the device's dark mode never changes colours (laptop = phone). |
| 18 Nov 2026 | Demo PPT: homepage link (Option B) to `/demoppt`; the Microsoft viewer loads only on tap, so no third-party cookies by default (Cookies/Privacy v1.4). |
| 18 Nov 2026 | Owner's account is the **platform administrator**: holds every role, switches role for real ("View as" in the account menu, Option A), and manages people in the People console (sidebar → Admin → People). The owner's email is recognised by a SHA-256 hash, never written in the public repo. Adding new people stays in Supabase for now; removing people needs owner approval (destructive SQL). |
| 18 Nov 2026 | Sign-in page shows only the logo, the sign-in card and the Trust & legal links (Option A). The product explanation lives on the public website, not repeated here. |
| 18 Nov 2026 | One journey, no duplication (see §4a). |
| 18 Nov 2026 | Operator Home: owner chose Option A "Status first" from three screenshot options. |
| 18 Nov 2026 | Permanent agent rules (`AGENT_RULES.md`): no hallucination, no regressions, design lock, ~3 screenshot options before any UI change, views over new tables, no Edge Functions, no legacy code, realtime UI with no page reload, PRD updated with every change. "Always make it live" applies **after** the owner picks an option. |

## 3. Current live state
**Public website** (route group `(site)`, shared header with menu drawer and footer):
- `/` homepage (gateway): headline, "See How It Works" / "Explore the Challenge", 3D swipe deck of six
  illustrative photos (`public/landing/deck/`), aqua wave, navy pilot strip. Text never overlaps imagery.
- `/challenge`, `/approach`, `/pilot`, `/about`, `/contact` (content in `src/lib/site/content.ts`, IFSL §3.2 facts).
- `/demoppt` **Demo PPT**: the owner's OneDrive PowerPoint (`src/components/public/ppt-embed.tsx`), loaded only after
  "View presentation" is tapped. Reached from the "Watch the Demo PPT" link under the homepage buttons and from the
  phone menu (under Contact). The laptop header is unchanged.
- `/demo/water-flow` **Live water-flow simulation**, labelled "Interactive Simulation — No Physical Equipment
  Connected." Reached from "Explore Live Simulation" under the homepage buttons.
  - **Engine:** `src/lib/sim/engine.ts`, one deterministic engine that drives the SVG digital twin and every number
    (River Athi → intake → pump → smart meter → distribution pipe → storage tank).
  - **Water and metering:** water moves inside the pipes only while it flows. The meter counts L/min and the
    cumulative total. The tank changes by net volume ÷ capacity.
  - **Controls:** manual ON/OFF; automatic mode (low/high thresholds with hysteresis); water use; speed ×1/×60/×300;
    faults (solar, leak, pump fault, low river) with restore; reset; a 10-step guided demo.
  - **Automatic mode:** AquaSentinel detects the low level and sends a start request; the simulated local pump
    controller starts the pump (operator confirms, or auto-confirm).
  - **Frontend only:** no database writes or API calls.
  - **Photo digital twin** (Option A "photo chain", 19 Nov): the owner's photos sit on the components, with live
    water, levels and meter drawn on top. The photos are `public/sim/*.jpg` (metadata stripped, faces blurred),
    captioned with their real place, plus a note that they show existing systems for illustration and are not
    AquaSentinel installations.
  - **Shared across pages and devices:**
    - Pages: `/demo/water-flow` (whole system), `/demo/technician` (controls), `/demo/community` (photo chain, tank,
      alerts). All are linked by a tab bar and a "Live on n screens" badge.
    - One screen leads and runs the engine (presence election); the others send actions and render snapshots
      (Supabase Realtime **broadcast** channel `sim-demo`). No tables, no writes.
    - The shared simulation is public: everyone who opens a demo page at the same time controls the same simulation.

**Trust & legal** (English + Kiswahili, `src/lib/legal/content.ts`): `/legal`, `/privacy`, `/terms`, `/cookies`,
`/security`. Public for visitors; inside the app shell for signed-in users. A simplified, small centred page
(Option A):
- each section as one summary row; tap a row to open its full text;
- one button, **Email us**;
- Back and English · Kiswahili as quiet text links.

**Sign-in** `/sign-in`: logo, sign-in card and Trust & legal links only (Option A); email + 6-digit one-time code (Supabase Auth OTP, `shouldCreateUser: false`); mobile tab
shows "coming soon". Email template: `supabase/templates/magic_link.html`.

**Signed-in app** (route group `(app)`): `/dashboard` is **Operator Home** (Option A "Status first",
`src/components/operator-home/operator-home.tsx`):
- greeting with the status in words;
- next-action card (most urgent alert, who is responsible, one orange button: Acknowledge / Assign technician /
  Close incident / Take this job, or Report a problem when all is well);
- four reading tiles (flow, storage, pump, solar).
Live via Realtime; no reload. Shell: logo, Main → Home, Programme → Trust & legal, site chip, account/environment menu.

**Platform admin (owner only):**
- **View as:** a 4-way switch (Operator / Technician / Water committee / Administrator) in the account menu.
  It calls `switch_my_role`, so the database really applies the role. A toast confirms "You're now viewing as …",
  and the whole app updates live via Realtime on `site_members`.
- **People console** `/console` (sidebar → Admin → People; also "Open People console" in the account menu):
  - lists everyone on the site with name, email, role, last sign-in and masked phone;
  - inline role change and name edit, each with a spinner, a green "Saved" check and a success toast;
  - updates live; non-admins are redirected to Home.

**Parked (not routed, kept for reuse)** in `src/_parked/` (excluded from build/lint): old Site, Tasks, Brief,
Incidents and dashboard screens, and the old Home components (`src/_parked/components/home/`). `/site`, `/tasks`, `/brief`, `/incidents/*` redirect to `/`.

## 4. Design system (locked)
Water colour theme; tokens are defined in `src/app/globals.css` and documented in `DESIGN_SYSTEM.md`.
- **One light theme on every device:** the site ignores the device's dark mode (`color-scheme: light`, no dark
  tokens), so a laptop in dark mode looks exactly like the phone.
- Public site `lp-*`: ink #0c1a3a, navy #0a3a6c, body #3e4f69, blue #015a86, blue-deep #01426f, cyan #08a8cd,
  band #f7fafb, pill #e2f3f9, wave #c7eaf6. Headings Instrument Serif (`.lp-heading`), body Geist.
- App: canvas #f5fbfa, line #dce8e6, teal #00afce, teal-strong #0093ae, accent #00738c, navy #003a72,
  orange #fb4803 (one primary action per screen only). Status colours always paired with an icon and a word.

## 4a. Experience principle: one journey, no duplication (owner decision, 18 Nov 2026)
- **Say it once.** Each piece of content lives in one place and is linked, not repeated:
  - what AquaSentinel is and the challenge → public website;
  - policies → Trust & legal;
  - work → the signed-in app.
  Before adding text or a section, check whether it already exists elsewhere.
- **One common navigation journey:** public site → Sign in → Home → detail screens → back to Home. It uses the same
  shell, the same back behaviour and the same patterns on every screen, so people always know where they are.
- **Keep the eye on the task:** short, purposeful screens with one obvious next step (one orange action). No filler,
  repeated marketing or dead ends, so nothing makes the user lose interest.
- Agents check every new screen and option against this before proposing it.

## 5. Data model (reuse before adding)
- **Tables (10):** `alert_rules`, `assets`, `audit_log`, `devices`, `incidents`, `profiles`, `readings`,
  `site_members`, `sites`, `sms_messages`. RLS on all; writes through SECURITY DEFINER functions.
- **Platform admin** (`20261118100000_platform_admin.sql`):
  - column `profiles.is_platform_admin`;
  - trigger `on_auth_user_owner` grants it, plus admin on every site, to the owner's email (matched by hash);
  - RPCs `switch_my_role`, `admin_list_members`, `admin_set_member_role`, `admin_update_profile`, all audited.
- **Views (7):** `device_health`, `device_uptime_24h`, `incident_timeline`, `kpi_summary`, `latest_readings`,
  `maintenance_history`, `site_status`. New read needs are met with views first.
- **Edge Functions:** none (`supabase/functions` does not exist). Time-based checks use `pg_cron`.
- **Realtime:** publication `supabase_realtime` covers `incidents`, `sms_messages`, `audit_log`, `readings`
  (`supabase/migrations/20261113100100_workflow.sql`) and `site_members` (platform admin migration). The client subscribes per site in
  `src/lib/data/site-data.tsx` and refetches in place; a 60 s poll is only a safety net.

## 6. Build roadmap (one screen per PR; owner picks one of ~3 screenshot options first)
1. ~~Operator Home~~: done, 18 Nov 2026 (Option A).
2. **Alert / incident detail** (next).
3. Technician jobs.
4. Site readings.
5. Committee reports.
6. Admin and user management: People console v1 done (18 Nov). Still to come: adding and removing people from the console.

## 7. Open owner actions
- Supabase Auth: **invite the owner's own email** (Authentication → Users → Invite user); the account becomes platform admin automatically; paste the Magic Link template; connect SMTP (e.g. Resend) and name the provider
  so it is added to the Privacy Notice and `DATA_PROTECTION_POLICY.md`. SMS provider later for mobile codes.
- Rotate the Supabase DB password and secret key exposed earlier.
- Create and monitor `info@aquasentinel.com`.
- Retention is applied manually; an automated job is due before the pilot.

## 8. Changelog (newest first; add one row per merged PR)
| Date | PR | Change |
|---|---|---|
| 19 Nov 2026 | (this PR) | Photo digital twin; technician and community demo pages; live cross-device sync (Realtime broadcast, leader election), unit tests. |
| 18 Nov 2026 | #40 | Live water-flow simulation (`/demo/water-flow`) with engine unit tests; homepage "Explore Live Simulation" link. |
| 18 Nov 2026 | #39 | Trust & legal simplified (Option A): summary rows, full text on tap, only "Email us". Removed the toolbar, chips, Print, At a glance, contents list, copy-link buttons and related cards; unused content removed. |
| 18 Nov 2026 | #38 | Dark-mode colour swap removed: laptop and phone show the same light theme (policy pages were turning dark on laptops in dark mode). |
| 18 Nov 2026 | #37 | Demo PPT page `/demoppt` with tap-to-load PowerPoint viewer; homepage link and phone menu item. Cookies/Privacy v1.4. |
| 18 Nov 2026 | #36 | Platform admin: owner account with every role, "View as" role switch, People console. Privacy Notice v1.3 and data protection policy updated. |
| 18 Nov 2026 | #35 | Sign-in page: intro and product story removed (Option A: logo, card, legal links). PRD §4a "one journey, no duplication". |
| 18 Nov 2026 | #34 | Operator Home (Option A) replaces the welcome placeholder. "Report a problem" stays on Home instead of opening a parked page. Old Home components parked. |
| 18 Nov 2026 | #33 | Added `docs/PRD.md` and portable `docs/AGENT_RULES.md`; `CLAUDE.md` loads both before every task. |
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
