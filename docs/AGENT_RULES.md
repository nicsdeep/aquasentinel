# Agent rules (portable, for any AI agent or LLM, on any project)

**Status: permanent. Owner decision, 18 November 2026.** These rules apply to every agent (Claude, other LLMs,
human contractors) before and during every task. They are written to be project-agnostic: copy this file
unchanged into any other repository and point that project's agent instructions (`CLAUDE.md`, `AGENTS.md`,
`.cursorrules`, etc.) at it, together with that project's own `docs/PRD.md`.

If a rule here conflicts with a direct, explicit instruction from the owner in the current request, follow the
owner and record the decision in the PRD changelog. Otherwise these rules win over an agent's own judgement.

## 1. Before starting any work
1. Read the project's **PRD** (`docs/PRD.md`) in full, including its changelog and open items. It is the single
   source of truth for what exists, what was decided and what must not change.
2. Read the project's own agent instructions (e.g. `CLAUDE.md`) and any documents they point to.
3. Check the PRD changelog for changes made since you last worked on the project. Treat them as current state;
   never undo them unless the owner asks.
4. If the request is unclear or conflicts with the PRD, ask the owner before changing anything.

## 2. No hallucination: do exactly what is prompted
- Do **only** what the current request asks. No extra features, refactors, renames, "improvements" or clean-ups
  that were not requested.
- State only facts you have verified in the code, data, logs or documents. If you have not verified something, say
  so. Never invent numbers, results, partners, deployments, users, test outcomes or URLs.
- Never report a task as done, deployed or passing without checking it.
- When you cannot do something, say what blocked you; do not quietly substitute something else.

## 3. No regressions
- Every change keeps everything that already works working. Before changing a shared component, find all its uses.
- Run the project's full checks (lint, types, tests, build, end-to-end/smoke) before handing over.
- Re-verify the flows the PRD lists as live after your change, not just the part you touched.

## 4. Design lock
- The approved design system (colour theme, tokens, typography, layout, section structure, imagery placement,
  navigation) does **not** change unless the owner explicitly asks for that specific change in the current request.
- Fix only what is asked. Never redesign, re-layout, recolour or move content as a side effect.
- Use the existing tokens and components. Do not add new colours, fonts or one-off styles.

## 5. UI changes: show options first
- Before applying any visible UI change, show the owner **about three options as screenshots** (rendered from the
  real app, at the owner's device sizes) and wait for the owner to choose.
- Implement only the chosen option, then send screenshots of the result as it appears live.
- Exception: a pure bug fix that restores the already-approved design needs no options; say so in the report.

## 6. Coding discipline
- **Reuse before adding.** Prefer database **views** (and existing functions) over new tables. Add a table only
  when no existing table or view can hold the data, and record why in the PRD.
- **No serverless/edge functions** (e.g. Supabase Edge Functions) unless the owner approves one for a stated reason.
  Keep logic in the database (functions, views, RLS) or the app's own server routes.
- **No legacy or dead code.** Delete what a change makes unused; do not leave commented-out code, unused exports,
  duplicate components or "v2" copies. (Code the owner asked to park for later reuse is the exception; keep it
  outside the build and listed in the PRD.)
- Small, focused changes; one purpose per pull request.
- Security basics always: no secrets in code or docs, least privilege, access control on every table.

## 7. Realtime-first UI (no page reloads)
- Any change in the database must appear in the UI **immediately, without a page reload**. Screens subscribe to
  database changes (e.g. Supabase Realtime `postgres_changes`) and update in place.
- After a user action, update the screen from the action's result or the realtime event; never ask the user to
  refresh, and never use full page reloads to show new data.
- Keep a slow background refresh only as a safety net for dropped connections.
- New tables or views that feed a live screen must be covered by the realtime publication (or by a subscribed base
  table) in the same change.

## 8. After every change: update the PRD
- In the **same** pull request, update `docs/PRD.md`: the "current state" sections that changed, and one new row in
  the changelog (date, PR, what changed, owner decision if any).
- If a change adds an owner decision or a rule, add it to the PRD's decisions list so the next agent sees it.

## 9. Verify and report
- Verify on the real, deployed system, not only locally.
- Screenshots for the owner show exactly what the owner sees: the live site, a fresh browser, the owner's device
  sizes, after fonts and images load, screen by screen, captioned with the version and time.
- Report: what changed, links (PR, commits), checks passed or failed, deployment status, what was verified, and
  anything not verified or still open.

## 10. Stop and ask
Ask the owner before anything destructive, irreversible, security-sensitive, costly, or that touches accounts,
data, credentials or other projects.
