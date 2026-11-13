# AquaSentinel product design and engineering doctrine

**Status:** adopted 14 Nov 2026 · applies to every screen, workflow, integration and change.

## 1. Purpose
Build one coherent, reliable product for the people who keep community water flowing. Reduce effort, remove
redundant work, protect operational correctness, and make the next meaningful action obvious.

**North star:** less thinking, fewer unnecessary actions, clearer decisions, reliable outcomes.

A design system is more than visual styling. It defines how interfaces behave, how people navigate, how
information is prioritised, and how features are built consistently ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).

## 2. Benchmarks
These are inspiration, not things to copy:
- human-centred, end-to-end journeys (Airbnb);
- clarity for complex operational tasks (Shopify Polaris);
- clarity, feedback, accessibility and familiar behaviour (Apple Human Interface Guidelines);
- reusable foundations and patterns (Atlassian);
- Nielsen's usability heuristics: visible system status, recognition over recall, consistency, error prevention;
- Elon Musk's five-step engineering method (§5), used as a heuristic and never a substitute for safety or compliance.

## 3. Hierarchy of authority
1. Law, data protection (Kenya Data Protection Act), safety, security, accessibility.
2. The database as the source of truth, site boundaries, RLS, and operational correctness.
3. [PROJECT_RULES.md](PROJECT_RULES.md): the KRCS criteria and the honesty rules.
4. The approved AquaSentinel tokens, components and patterns.
5. This doctrine.
6. Feature-specific decisions.

When rules conflict, record the conflict and ask the owner. Never silently override a higher rule.

## 4. Ten product principles
1. **One system, one experience.** Dashboard, phone, SMS and reports share one incident state. Nobody
   reconstructs what happened elsewhere.
2. **Signal before noise.** Show actionable faults, risks and ownership first. "Most recent" is not
   "most important".
3. **Eliminate before automating.** Question why a step exists; remove it before making it faster.
4. **One authoritative source of truth.** The database owns state. Keep distinct states distinct: "suspected" is
   not "confirmed", "recovered" is not "closed", and "offline" is not "normal".
5. **Preserve context.** Back returns along the real path. Keep drafts and progress. Refresh data in place, with
   no full-page reloads.
6. **Familiarity over novelty.** Use the same tokens, components and navigation everywhere. Never replace clear
   lists with decorative mosaics.
7. **Progressive disclosure.** Show what, where, status, owner and next action first. Keep evidence and history
   one tap away.
8. **Fast, predictable feedback.** Every action shows loading, success or failure. Never claim success before
   the server confirms. Prevent double submission.
9. **Human control where it matters.** Automate detection, alerts and recovery checks. People confirm diagnoses,
   close incidents and approve consequential actions. Everything is audited. SMS never controls a pump.
10. **Measure real outcomes.** Optimise water-service reliability, not screen appearance or feature count.

## 5. Five-step engineering method
Apply in order to every significant workflow:
1. **Question the requirement.** Who needs it? What evidence makes it necessary? Is it required for safety,
   compliance or the brief?
2. **Delete** unnecessary parts: duplicate data entry, redundant approvals, dead UI, extra tables (use views).
   Check dependencies first.
3. **Simplify** by reusing existing data, components and SQL functions. Make status and ownership clear.
4. **Accelerate:** reduce waiting, navigation and repeated requests, while keeping state correct and observable.
5. **Automate** stable processes, with permissions, retries, idempotency, monitoring and a human escalation path.

**Never delete or automate away a required verification, security check or audit record.**

## 6. Interface standards
- **Navigation:** keep route history and context; Back follows the real path; no surprise redirects for a valid
  session.
- **Lists:** compact and legible on phone and desktop, with clear priority (open first) and obvious filter states.
  Exports cover only what the user is allowed to see, and are clearly labelled.
- **Dialogs and forms:** validate early, explain recoverable errors, confirm consequential actions, and choose
  defaults from the current state when the dialog opens.
- **Incident page:** at a glance, what happened, the evidence, the status, the owner and the next action. Full
  record and history below.
- **Motion and accessibility:** subtle, purposeful transitions; visible focus; keyboard support; labelled
  controls; WCAG AA contrast; reduced-motion support.

## 7. Reference workflow: one incident, every channel
**Reading arrives → rule detects a sustained condition (suspected cause) → incident opens → dashboard and SMS
alert → acknowledge (web or SMS) → assign a local technician → findings recorded (suspected or confirmed) →
recovery verified (readings or a qualified check) → close with outcome and reason → maintenance record and
measures.**

Every step is one SQL function used by every channel, and every step is written to the audit log.

## 8. Engineering guardrails
- The database is the source of truth; enforce RLS and least privilege; never expose another site's data.
- Use atomic transactions for multi-record changes; make jobs and ingestion idempotent (sequence numbers).
- Prefer existing services and components over parallel implementations; keep code short, modular and tested;
  no legacy duplication.
- Refresh only the affected data; no full-page reloads for routine updates.
- Confirm high-impact actions and record who did what, when and through which channel.
- Support phones and laptops without changing the visual identity.
- Never claim a performance target without measuring it.

## 9. Acceptance criteria for any change
A change is ready only when:
- The current behaviour and the problem are documented, with evidence (code, data or observation).
- Existing functionality and permissions are preserved.
- The UI uses the approved tokens and components.
- Loading, empty, success, failure and recovery states are defined.
- Back navigation and drafts keep their context.
- RLS and site isolation are tested (pgTAP in CI).
- Automation has idempotency, observability and manual escalation.
- Outcomes can be measured before and after.

## 10. Measurement scorecard
| Measure | Definition | Direction |
|---|---|---|
| Time to acknowledge | Detection → acknowledgement | Down |
| Downtime | Detection → verified recovery | Down |
| Early-detection rate | Faults caught at warning stage ÷ repaired faults | Up |
| False-alarm rate | False alarms ÷ closed incidents | Down |
| Maintenance completion | Closed ÷ opened incidents | Up |
| Manual actions per incident | Taps or entries needed to close a typical incident | Down |
| Device uptime | Reporting time ÷ observed time | Up |
| Operator confidence | Short task-based feedback from operators and technicians | Up |

Define cohorts, exclusions and baselines before setting numerical targets. Never optimise speed at the expense of
safety or correctness.

## 11. Delivery process
**Audit → Evidence → Prioritise → Approve → Implement → Test → Measure → Document.**

For each change, record:
- the existing behaviour, the problem and the evidence;
- the root cause and the fix;
- the affected modules, risks and dependencies;
- the acceptance tests and the status.

Do not build from screenshots alone when code and data are available.

---

**Core rule:** build fewer unnecessary things, make the necessary things easier, and never compromise trust, safety
or operational correctness.
