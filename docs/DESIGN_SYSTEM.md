# AquaSentinel design system

The single source of truth for every surface. Tokens live in `src/app/globals.css`; components in
`src/components/ui/`. Product and engineering principles are in [PRODUCT_DOCTRINE.md](PRODUCT_DOCTRINE.md).
Built for a non-technical water operator on an ordinary Android phone first, then laptops (PROJECT_RULES §6).

> **Design lock (owner decision, 16 Nov 2026).** The approved design (layout, section structure, colours, typography,
> imagery placement, navigation) changes only when the owner explicitly asks for that specific change. Fix only what is
> asked; no redesign, re-layout or recolouring as a side effect. Ask first when a request seems to need more.

## 01 · Colour: five tones, strict discipline

**One light theme everywhere (owner decision, 18 Nov 2026):** the approved light water theme is used on every device. The site ignores the device's dark mode (`color-scheme: light`, no dark token set), so laptop and phone always look the same.
Navy and aqua are taken from the approved logo (§07), so the interface and the logo read as one brand.
Use token names in classes (`bg-as-dark`), never raw hex in components.

| Token | Hex | Use |
|---|---|---|
| `as-navy` | `#003A72` | Logo navy (reserved) |
| `as-night` | `#041F3A` | Logo navy, deepened (reserved) |
| `as-dark` | `#0A1515` | Dark surfaces, strong (dark) buttons, primary text |
| `as-deep` | `#0F2626` | Deep panels |
| `as-teal` | `#00AFCE` | Logo aqua: accent on dark surfaces, chart area, focus ring, icons in dark chips |
| `as-orange` | `#FB4803` | **The one primary action per screen.** Orange is earned. |
| `as-light` | `#F4F6F6` | Neutral light surface (the canvas is `#F5FBFA`, §08) |
| `as-cream` | `#F7F3ED` | Warm panels (highlights) |
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
- **Serif: Instrument Serif** for the voice, used sparingly: page titles and the "Sign in" card title.
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
- **Sign-in page** (public, owner's choice Option A, 18 Nov 2026): one centred column (`max-w-md`): the logo, the sign-in card, then the Trust & legal links. No product story here; that lives on the public website.
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
- **Operator Home** (owner's choice, Option A "Status first", 18 Nov 2026; `src/components/operator-home/`). One
  column, `max-w-4xl`, top to bottom:
  - **Greeting:** serif display "Good morning, Name. Your water is *running well.*" The status words are in italic:
    deep logo aqua (`as-teal-strong`) when well, otherwise the status colour ("needs attention", "needs a check",
    "not reporting"). Subtitle: site name and data age.
  - **Next-action card:** the most urgent open alert (title, reference, stage, detected age, who is responsible), with
    **one** orange button for the next step (Acknowledge → Assign technician → Close incident; a technician gets Take
    this job). While a technician is repairing it, the card says so and shows no button. With no alerts: "Nothing needs
    you right now" and **Report a problem**.
  - **Four reading tiles:** Water flow, Storage level, Pump, Solar power. Each has a tinted icon, value and unit, and
    state and age; greyed with "May be out of date" after 15 minutes.
  - Everything updates live via Realtime, with no reload.
  - The earlier Home (summary cards, journey, action centre) is parked in `src/_parked/components/home/`.
- **Orange:** exactly one on Home, on the next-action card.
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
Simplified for people with little time (owner's choice, Option A, 18 Nov 2026): a small, centred page (`max-w-2xl`),
summary first, full text one tap away, and **one button**.
- **Hub** `/legal`: the serif title ("Your data, *in plain words.*"), a quiet "Updated · Version" line and the
  English · Kiswahili text toggle, then one white card listing the four documents (name + one line), then **Email us**.
- **Document pages**:
  - a quiet **Back** text link;
  - the centred serif title and lead, "Updated · Version", and the English · Kiswahili toggle;
  - **summary rows**: each section's heading and its one-sentence summary; tap a row to open the full text
    (tables become cards on phones);
  - a link to a section (e.g. `/privacy#rights`) opens that row;
  - **Email us**, the page's only button (orange).
  - Not used: breadcrumbs, info chips, a Print button, "At a glance" cards, a contents list, copy-link buttons and
    related-document cards.
- **One layout system, two contexts.** The legal routes live in the `(app)` route group, with the same URLs.
  - **Signed in:** `AppShell` renders them inside the normal shell, with the sidebar (*Trust & legal* active), the
    top bar and the session. It is the same layout instance, so the workflow is not reloaded.
  - **Visitors:** `AppShell` renders the public layout (`LegalChrome`) on legal paths only. Every other app route
    still requires sign-in.
  - The page content (`LegalDoc`, `LegalHub`) has no chrome of its own.
- **Back** returns to the previous in-app screen (with its state), or to Home or sign-in when the page was opened directly.
- **Entry points:** sidebar *Programme*, the account menu (works on phones), search, the links under the sign-in card and the public footer.
- **Language:** English · Kiswahili text toggle, kept in the URL (`?lang=sw`) on every page.
- **Print** (browser print): navigation and buttons are hidden, and every section prints expanded.

## 10 · Public website
- **Homepage hero** (26 Nov 2026, supersedes the 3D deck):
  - **Video:** the owner's River Athi footage, full width under the white header. `object-cover`, centred on laptop,
    62 % on phones. Autoplay, muted, loop, inline, no controls, first-frame poster.
  - **Overlay:** `lp-ink` 85 % → transparent from the left (laptop); from the bottom (phone).
  - **Text:** white Instrument Serif headline. Primary blue button and an outline-white secondary.
  - **Caption pill:** "River Athi · Recorded footage", bottom-right (laptop) or top-right (phone).
  - The water wave leads into the `lp-band` principles band (laptop) or the navy pilot strip (phone).
- **Live simulation** (`/demo/water-flow`, 18 Nov 2026; photo chain and technician/community pages 19 Nov 2026):
  - **Photo chain:** rounded photo cards (white border, dark caption bar) joined by the live pipeline. The tank's water
    level, threshold marks and percentage are drawn over the tank photo; the river level over the river photo. A
    one-line photo note sits under the diagram.
  - **Demo frame:** label pill, then a tab bar (Whole system · Technician · Community) and a "Live on n screens"
    status dot.
  - **Layout:** label pill, serif title, then the SVG digital twin beside a compact control panel (laptop), with the
    live stats below. On phones the diagram scrolls sideways instead of shrinking.
  - **Motion:** water is shown inside pipes (an inner path with moving dashes on the same geometry) only while it
    flows. Reduced motion stops all movement; values still update.
  - **Orange:** one action at a time (Turn pump ON, Confirm start or Restore normal operation).
- **Demo PPT** (owner's choice, Option B, 18 Nov 2026): a text link "Watch the Demo PPT" under the homepage
  buttons, and a phone-menu item under Contact. The `/demoppt` page uses PageHero plus a 16:9 card that loads
  Microsoft's viewer only on "View presentation".
**Information architecture: the homepage is a gateway, not a document.** It shows the essentials; details live on their
own pages (progressive disclosure).

| Route | Purpose |
|---|---|
| `/` | Gateway: full-width River Athi video hero, principles band, problem summary (laptop) or pilot strip (phone). |
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
