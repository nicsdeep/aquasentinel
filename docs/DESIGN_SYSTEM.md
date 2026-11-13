# Design system

Built for a non-technical water operator on an ordinary Android phone first, then laptops (PROJECT_RULES §6).
Source: `src/app/globals.css` (tokens) and `src/components/ui/` (components).

## Principles
1. **One obvious next action** per screen. Avoid crowded dashboards.
2. **Plain language and real units:** "No water flow while the pump runs. 0.1 m³/h for 12 min", never error codes.
3. **Never colour alone:** every state is an icon plus a word plus a colour.
4. **Always show data age:** "Last reading 4 min ago (13 Nov, 11:55 EAT)". Stale data is never shown as live.
5. **Honest without noise:** the product is presented as live. Where readings come from is stated once, plainly:
   the virtual monitoring unit's name, the "Data source" line in site info, and the brief page (owner decision, 13 Nov).
6. **Every consequential action** asks for confirmation and reports success or failure.

## Tokens
| Group | Tokens | Notes |
|---|---|---|
| Brand | `navy-950…700`, `teal-600`, `sky-500`, `leaf-500` | Sampled from the approved logo. Do not add colours without approval. |
| Surfaces | `canvas`, `surface`, `surface-muted`, `line` | Switch automatically in dark mode. |
| Text | `ink`, `ink-muted`, `ink-subtle` | WCAG AA contrast on `surface` and `canvas`. |
| Status | `ok`, `warn`, `crit`, `off`, `info` (+ `-soft` backgrounds) | Normal, Warning, Needs attention, Offline, Information. |
| Type | Inter Variable (self-hosted), `.tabular` for numbers | No runtime font requests. |
| Shape | `rounded-card` (16 px), `shadow-card` | Buttons and inputs are at least 44 px high. |

## Site states (`src/lib/status.ts`)
| State | Icon | Meaning shown to users |
|---|---|---|
| Normal | circle-check | Water is flowing as expected. |
| Warning | triangle-alert | Something is drifting from normal. Check it soon. |
| Needs attention | octagon-alert | Water service is at risk. Act now. |
| Offline | wifi-off | No recent data from the site. Readings may be out of date. |

## Components
`Button` (primary, secondary, ghost, danger; loading state) · `Card`, `CardHeader` · `Badge`, `StatusBadge`,
`Dialog` (native `<dialog>`: focus trap, Escape) · `ToastProvider`/`useToast` (polite live
region) · `Logo` (approved logo and wordmark) · `AppShell` (navy sidebar on laptops; hamburger menu and bottom
navigation on phones).

## Layout
- Phone first: a 16 px gutter, no horizontal scrolling, a bottom bar for the main sections, safe-area padding.
- Laptop: a 16.5 rem navy sidebar and content up to 72 rem wide.
- Navigation lists only screens that exist (`src/components/shell/nav.ts`).
