# AquaSentinel design system

The single source of truth for every surface. Tokens live in `src/app/globals.css`; components in
`src/components/ui/`. Product and engineering principles are in [PRODUCT_DOCTRINE.md](PRODUCT_DOCTRINE.md).
Built for a non-technical water operator on an ordinary Android phone first, then laptops (PROJECT_RULES §6).

> **Design lock (owner decision, 16 Nov 2026).** The approved design (layout, section structure, colours, typography,
> imagery placement, navigation) changes only when the owner explicitly asks for that specific change. Fix only what is
> asked; no redesign, re-layout or recolouring as a side effect. Ask first when a request seems to need more.

## 01 · Colour: five tones, strict discipline
Navy and aqua are taken from the approved logo (§07), so the interface and the logo read as one brand.
Use token names in classes (`bg-as-dark`), never raw hex in components.

| Token | Hex | Use |
|---|---|---|
| `as-navy` | `#003A72` | Logo navy (reserved) |
| `as-night` | `#041F3A` | Logo navy, deepened (reserved) |
| `as-dark` | `#0A1515` | Dark surfaces, strong (dark) buttons, primary text |
| `as-deep` | `#0F2626` | Deep panels, dark-mode surfaces |
| `as-teal` | `#00AFCE` | Logo aqua: accent on dark surfaces, chart area, focus ring, icons in dark chips |
| `as-orange` | `#FB4803` | **The one primary action per screen.** Orange is earned. |
| `as-light` | `#F4F6F6` | Neutral light surface (the canvas is `#F5FBFA`, §08) |
| `as-cream` | `#F7F3ED` | Warm panels (sign-in story, highlights) |
| `as-white` | `#FFFFFF` | Cards |
| `as-gray2` | `#CFDADA` | Strong dividers (hairlines use `line` `#DCE8E6`, §08) |
| `as-muted` | `#7B9090` | Large or decorative secondary text only |

**Accessibility adjustments** (accessibility outranks style):
- `accent` (`#00738C`) is the logo aqua deepened for text, links and chart lines on light surfaces.
- `ink-subtle` (`#5F7474`) is `as-muted` deepened for small text. Both meet WCAG AA.

**Status colours are functional, not brand.** They are always icon + word + colour, never colour alone:

| State | Colour | Icon | Meaning |
|---|---|---|---|
| Normal | green | circle-check | Water is flowing as expected. |
| Warning | amber | triangle-alert | Something is drifting from normal. Check it soon. |
| Needs attention | red `#C62828` (never the CTA orange) | octagon-alert | Water service is at risk. Act now. |
| Offline | slate | wifi-off | No recent data. Readings may be out of date. |

## 02 · Type: two families, one voice
- **Serif: Instrument Serif** for the voice, used sparingly: page titles and the sign-in hero.
- **Home greeting and card titles** use Instrument Serif (§08). The status phrase is italic and coloured.
- **Sans: Geist** for the work: UI, body text and numbers. Never italic.
- Both are self-hosted (no runtime font requests).

| Class | Spec | Use |
|---|---|---|
| `type-display` | serif, `clamp(52px, 8vw, 112px)`, leading 0.92, tracking −0.03em | Sign-in hero |
| `type-h1` | serif, `clamp(32px, 3.6vw, 48px)`, leading 1 | Page titles |
| `type-h2` | serif, `clamp(24px, 2.4vw, 32px)`, leading 1.1 | Rare large section titles |
| body | Geist 14 px, leading 1.55 | UI and text |
| `type-eyebrow` | 11 px, tracking 0.28em, uppercase, medium | Context label above a title |
| `tabular` | tabular numerals | Readings and costs |

Headings are always clamped, never fixed pixel sizes.

## 03 · Layout and spacing
- **Sign-in page** (public): page max width 1200 px, `px-6 md:px-10`. Light hero, then a cream story panel.
- **App workspace:** an operational shell, not scroll-snap frames.
  - Laptop: a floating white sidebar card (17.5 rem) and a top bar card; content up to 88 rem (§08).
  - Phone: a header with hamburger menu, a bottom bar, a 16 px gutter, no horizontal scroll and safe-area padding.
- **Shape:**
  - cards `rounded-2xl` (`rounded-card`);
  - large panels and banners `rounded-3xl` (`rounded-panel`);
  - border `as-gray2`;
  - shadow `0 30px 80px -40px rgb(10 21 21 / .18)`.
- Whitespace is generous, never cramped.

## 04 · Components
**CTA ladder** (`Button`):

| Variant | Look | Rule |
|---|---|---|
| `primary` | orange, pill | **One per screen** (and one per dialog). Two is already noise. |
| `dark` | `as-dark`, pill | The default strong action on light surfaces. |
| `secondary` | outline, pill | Alternatives. |
| `ghost` / `link` | text | Low-emphasis actions; links in `accent` teal. |
| `danger` | red | Destructive actions only. |

**Where orange goes:**
- Home: **View open alerts** while alerts are open, otherwise **Report a problem** (§08);
- on the incident page, the next step for the signed-in role (Acknowledge → Assign / Take this job →
  Record findings → Confirm water is flowing → Close incident);
- the submit button inside a dialog.

**Other components:**
- `Eyebrow`
- `Card` and `CardHeader` (serif title)
- `Badge` and `StatusBadge`
- `Dialog` (native `<dialog>`: focus trap, Escape)
- `ToastProvider` / `useToast` (polite live region)
- `Logo` (the approved logo; see §07)
- `AppShell`
- **Icons:** `lucide-react`, stroke 2. Sizes 12 (inline caption), 14 (UI), 16 (buttons), 18–20 (feature).

## 05 · Content principles
1. One obvious next action per screen.
2. Plain language and real units: "No water flow while the pump runs: 0.1 m³/h for 12 min", never error codes.
3. Always show data age: "Updated 4 min ago (13 Nov, 11:55 EAT)". Stale data is greyed, never shown as live.
4. **Honest without noise:** production-realistic screens with no demo labels. The demonstration environment is named
   once (account menu); reading sources are visible on inspection; SMS are "Delivered" only on provider confirmation.
5. Every consequential action asks for confirmation and reports success or failure.

## 06 · Discipline
| Do | Don't |
|---|---|
| One orange primary action per screen | Never put two orange actions on one screen |
| Serif for voice, sans for work | Never use italics for urgency; never italicise Geist |
| Clamp every heading | Never use fixed px on page headings |
| Use token names | Never bypass the palette with inline hex |
| Pair every status with an icon and a word | Never convey a state by colour alone |
| Use `Link` for internal routes | Never use a bare `<a>` for internal navigation |
| Leave generous whitespace | Never crowd a dashboard with equal-weight cards |

## 07 · Logo
The approved logo is the owner's logo kit of 14 Nov 2026: an "a" water mark (navy letter, aqua water waves) and the
"aquaSentinel" wordmark. It replaces the earlier "A" mark.

**Every logo file is in one folder: `public/brand/`.** Git is the source of truth. Vercel serves the files from
`/brand/…`.

| File | Use |
|---|---|
| `originals/AquaSentinel_Favicon.svg`, `originals/AquaSentinel_Logo_Horizontal.svg` | The owner's files, unmodified (masters). Not used in the UI because of their size. |
| `logo.png` | Horizontal logo with navy wordmark, for light backgrounds (sign-in, phone header) |
| `logo2.png` | **Logo2**: the same logo with white wordmark, for dark backgrounds |
| `logo-mark.png` | The water mark alone, for square spaces |
| `icon.png`, `apple-icon.png` | Browser favicon and iPhone home-screen icon (linked in `src/app/layout.tsx`) |
| `icon-192.png`, `icon-512.png` | Installable app (PWA) icons (`src/app/manifest.ts`) |

Rules:
- Always render it through the `Logo` component.
- Never redraw, recolour, stretch or retype the logo.
- Minimum height is 24 px. Keep clear space of at least half the logo height around it.
- Use the navy version on light surfaces and Logo2 on dark surfaces. Never put the navy version on a dark background.
- To change the logo, replace the originals and regenerate every file in this folder in the same PR.

## 08 · Clean workspace (owner's reference, 14 Nov 2026)
The interface is calm and light: white cards on a whisper-of-mint canvas, hairline borders, a soft shadow, serif
headings and generous space. It replaces the earlier teal sidebar, header illustration and card waves.

- **Shell:**
  - **Floating sidebar card** (white, `rounded-3xl`). Logo in a soft panel; section labels **Main** and **Programme**;
    the active item is `info-soft` with a teal icon. *Alerts & incidents* opens its sub-items **Open** and **Closed**.
  - **Top bar card:**
    - the site menu (with a status dot);
    - **search** across open alerts, recent incidents, screens and actions (every result opens something real);
    - *Welcome Name* and a **role chip**;
    - a **bell** for Messages (orange dot when there are unread messages);
    - an **avatar** that opens the account and environment menu.
  - **Phone:** a compact header (logo, bell, avatar) and the bottom navigation.
- **Home, top to bottom:**
  - **Hero:**
    - a serif display greeting with the status phrase in italic: "Running well." in the deep logo aqua
      (`as-teal-strong`), or the status colour when not well;
    - a subtitle with the site and data age;
    - **Messages** and **Report a problem** on the right.
  - **Two summary cards:**
    - **Open alerts**: count, the most urgent alert in words with its owner, and chips for New / Being repaired /
      Water back, to close.
    - **Water system**: pump state, and chips for flow, storage and solar, each greyed when out of date.
  - **How it works** note (rules, SMS without internet, never controls the pump).
  - **Incident journey**: Detected → Alerted → Acknowledged → Technician assigned → Repaired → Verified and closed, for
    the most urgent open incident, or the last closed one.
  - **Today** action centre: Tasks for you, Routine check and Messages, plus **Refresh**.
- **Orange:** at most one on Home. It is **View open alerts** while alerts are open; otherwise **Report a problem**.
- **Cards:** `rounded-3xl`, border `line`, shadow `0 10px 30px rgb(26 70 70 / .06)`. Card titles in Instrument Serif;
  stat chips in `surface-soft` with serif numbers.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F5FBFA` | App background |
| `line` | `#DCE8E6` | Hairline borders |
| `surface-muted` | `#EFF6F5` | Hover, neutral chips |
| `surface-soft` | `#F9FBFB` | Stat chips, inputs, logo panel |
| `as-teal-strong` | `#0093AE` | Logo aqua deepened for large display text (3.5:1) |

## 09 · Trust & legal pages
Benchmarked on the clearest public privacy centres: summary first, full text second, one idea per section.
- **Hub** `/legal`: a serif hero ("Your data, *in plain words.*"), one card per document, your rights as chips, and a contact card.
- **Document pages**:
  - breadcrumb, kicker, serif title, lead;
  - chips for updated date, version and reading time, plus **Print or save as PDF**;
  - **At a glance** cards that link to sections;
  - a sticky **On this page** contents list that highlights the section being read (a collapsible list on phones);
  - numbered sections, each with an **In short** line;
  - tables that become cards on phones;
  - a copy-link button per section;
  - contact (the page's one orange action) and related documents.
- **One layout system, two contexts.** The legal routes live in the `(app)` route group, with the same URLs.
  - **Signed in:** `AppShell` renders them inside the normal shell, with the sidebar (*Trust & legal* active), the
    top bar and the session. It is the same layout instance, so the workflow is not reloaded.
  - **Visitors:** `AppShell` renders the public layout (`LegalChrome`) on legal paths only. Every other app route
    still requires sign-in.
  - The page content (`LegalDoc`, `LegalHub`) has no chrome of its own.
- **Back** returns to the previous in-app screen (with its state), or to Home or sign-in when the page was opened directly.
- **Entry points:** sidebar *Programme*, the account menu (works on phones), search, the sign-in page footer and the public footer.
- **Language:** English / Kiswahili switch kept in the URL (`?lang=sw`) on every page.
- **Print:** navigation, contents and buttons are hidden; only the text prints.

## 10 · Public website
**Information architecture: the homepage is a gateway, not a document.** It shows the essentials; details live on their
own pages (progressive disclosure).

| Route | Purpose |
|---|---|
| `/` | Gateway with a **3D card swipe deck** of six illustrative images (`public/landing/deck/`, metadata stripped; swipe, arrows, dots, keyboard; auto-advances every 6 s and pauses when touched; still for reduced motion; labelled "Illustrative images"). **Text never sits on imagery:** phones put the deck in its own band below the buttons; laptops use two columns with a 64 px gap. **Phone:** the approved mobile design (logo and menu; headline with a cyan underline under "water."; one sentence; **See How It Works**; quiet **Explore the Challenge** link; compact photo with an aqua wave that flows into the navy Ngomano pilot strip). The four destinations live in the menu, not on the page (owner decision, 16 Nov 2026). **Laptop:** the approved desktop hero, pillars band and challenge summary. |
| `/challenge` | Water challenges in Ngomano, grouped facts from IFSL pack §3.2, source named |
| `/approach` | Detect → Alert → Respond → Record, what it would not do, SMS, optional detail, prototype link |
| `/pilot` | Proposed activities, evaluation, limitations, indicative KES 350,000 |
| `/about` | Background (independent, no partnership implied), responsible development |
| `/contact` | Verified email, privacy and security routes |
| `/legal`… | Existing trust & legal pages (same site header and footer for visitors) |

- **One shared shell** (`src/components/public/site-shell.tsx`) for every public page.
  - **Header:** laptop shows four links with active underlines plus Sign In (Dashboard when signed in). Phone shows the
    logo and a menu button.
  - **Drawer:** a native modal dialog (focus trapped and returned, Escape closes it, closes on navigation). It matches the
    approved reference: logo and close button; The Challenge, Our Approach, Pilot in Ngomano, About and Contact, each with
    a cyan icon, a divider and a chevron; a navy Sign In button; water waves at the bottom.
  - **Footer:** logo, cyan wave edge, verified email, *Explore* and *Legal* (collapsible on phones), and a full-width
    deep-navy copyright strip, "© 2026 AquaSentinel". No social icons until accounts exist.
- **Every content page:** eyebrow, serif title, one short lead, hairline-separated subsections, open icon rows (no boxed
  cards), `<details>` for optional depth, and a **Next** link so no page is a dead end.
- **Honesty:** Ngomano facts come only from IFSL §3.2. Capabilities are written as "would", the pilot as "proposed", and
  the limitations are stated. The photo is illustrative.

| Token | Hex | Use |
|---|---|---|
| `lp-ink` | `#0C1A3A` | Headlines, navigation |
| `lp-navy` | `#0A3A6C` | Eyebrows and rules |
| `lp-body` | `#3E4F69` | Body text |
| `lp-blue` / `lp-blue-deep` | `#015A86` / `#01426F` | Primary button / Sign In and footer |
| `lp-cyan` | `#08A8CD` | Icons |
| `lp-band` | `#F7FAFB` | Pillars and alternate sections |
| `lp-pill` | `#E2F3F9` | Location pill, icon tiles, waves |
| `lp-wave` | `#C7EAF6` | Water waves |
