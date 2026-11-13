# AquaSentinel design system

The single source of truth for every surface. Tokens live in `src/app/globals.css`; components in
`src/components/ui/`. Product and engineering principles are in [PRODUCT_DOCTRINE.md](PRODUCT_DOCTRINE.md).
Built for a non-technical water operator on an ordinary Android phone first, then laptops (PROJECT_RULES §6).

## 01 · Colour: five tones, strict discipline
Use token names in classes (`bg-as-dark`), never raw hex in components.

| Token | Hex | Use |
|---|---|---|
| `as-dark` | `#0A1515` | Sidebar, dark surfaces, strong (dark) buttons, primary text |
| `as-deep` | `#0F2626` | Active navigation, deep panels, dark-mode surfaces |
| `as-teal` | `#59C3C3` | Accent on dark surfaces, chart area, focus ring, icons in dark chips |
| `as-orange` | `#FB4803` | **The one primary action per screen.** Orange is earned. |
| `as-light` | `#F4F6F6` | App canvas |
| `as-cream` | `#F7F3ED` | Warm panels (sign-in story, highlights) |
| `as-white` | `#FFFFFF` | Cards |
| `as-gray2` | `#CFDADA` | Borders and dividers |
| `as-muted` | `#7B9090` | Large or decorative secondary text only |

**Accessibility adjustments** (accessibility outranks style):
- `accent` (`#1D7A7A`) is `as-teal` deepened for text on light surfaces.
- `ink-subtle` (`#5F7474`) is `as-muted` deepened for small text. Both meet WCAG AA.

**Status colours are functional, not brand.** They are always icon + word + colour, never colour alone:

| State | Colour | Icon | Meaning |
|---|---|---|---|
| Normal | green | circle-check | Water is flowing as expected. |
| Warning | amber | triangle-alert | Something is drifting from normal. Check it soon. |
| Needs attention | red `#C62828` (never the CTA orange) | octagon-alert | Water service is at risk. Act now. |
| Offline | slate | wifi-off | No recent data. Readings may be out of date. |

## 02 · Type: two families, one voice
- **Serif: Instrument Serif** for the voice, used sparingly: the Home greeting (with one emphasised status phrase in
  italic, coloured by status) and page titles. Card titles use Geist semibold.
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
  - Laptop: a dark sidebar (16.5 rem) and content up to 72 rem.
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
- Home: the most urgent incident's next step for the signed-in role, otherwise today's routine check (**Start**);
- on the incident page, the next step for the signed-in role (Acknowledge → Assign / Take this job →
  Record findings → Confirm water is flowing → Close incident);
- the submit button inside a dialog.

**Other components:**
- `Eyebrow`
- `Card` and `CardHeader` (serif title)
- `Badge` and `StatusBadge`
- `Dialog` (native `<dialog>`: focus trap, Escape)
- `ToastProvider` / `useToast` (polite live region)
- `Logo` (the approved logo and wordmark; never redesigned)
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
