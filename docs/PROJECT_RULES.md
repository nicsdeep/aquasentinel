# AQUASENTINEL_PROJECT_RULES.md

**Project:** AquaSentinel — Detect Early. Respond Locally. Keep Water Flowing.  
**Owner / project lead:** Nicholas Kioko  
**Status:** Governing requirements for proposed implementation; not a statement that features or field outcomes already exist.  
**Primary source:** *IFSL Digital Innovation Challenge — Lower Eastern Information Pack*, especially §§ 3.2, 4.1, 4.2 and 4.2.1; approved AquaSentinel concept and presentation requirements.  
**Decision rule:** These requirements apply to research, designs, code, prototypes, integrations, tests, documentation, presentations and future changes. If a feature conflicts with any rule, fix the design rather than silently bypassing the rule. Record and obtain owner approval for any proposed exception.

## 1. Mission and scope

Build **one unified, user-first community water-system monitoring and maintenance platform** for resource-constrained settings such as Ngomano, Makueni. Prioritise the real KRCS water problem: unreliable pumping, solar downtime, aging conveyance, insufficient elevated storage, limited maintenance capacity and weak infrastructure oversight. AquaSentinel proposes earlier detection, understandable alerts, local response and usable maintenance records. It does **not** manufacture water, replace physical repairs, guarantee water safety or by itself resolve drought.

## 2. The eight KRCS judging criteria are mandatory acceptance gates

| Official criterion | Required project evidence |
|---|---|
| 1. Relevance & Problem Fit | Trace each proposed feature to the documented community need; validate assumptions during site assessment. |
| 2. Innovation & Differentiation | Explain the meaningful improvement over isolated monitoring: integrated sensing, accessible SMS, accountable local response and reusable records. No novelty claims without evidence. |
| 3. Technical Feasibility | Working end-to-end, testable path from sensors to authenticated ingestion, alerts, responses, recovery and reporting, with realistic power/connectivity/maintenance constraints. |
| 4. Data Protection & Security | Privacy-by-design, Kenyan data-protection obligations, device and user identity, least privilege, encryption, RLS, secure secrets, minimisation and auditable access. |
| 5. Impact Potential and Risk | Define baseline and measures for alert timeliness, response time, downtime, incident completion, adoption and operating cost; enumerate and mitigate safety, security, sensor and communications risks. |
| 6. Scalability & Sustainability | Costed pilot plus realistic recurring operating cost, local maintenance, support and conditional expansion after evaluation. |
| 7. Team Capacity | Identify real developer, hardware, water-operations and field-validation responsibilities. Never imply unconfirmed partners or expertise. |
| 8. Inclusivity & Equity | Use plain-language, accessible mobile/desktop UI and an ordinary-phone SMS path; consult intended users, including women, youth and underserved households. |

A feature is not “done” merely because it looks attractive: it must meet its relevant acceptance criteria, be tested and have its current status documented.

## 3. Unified, modular architecture

- One authoritative Supabase/PostgreSQL backend for users, sites, devices, readings, rules, alerts, incidents, maintenance actions, SMS events and reports. No separate or conflicting stores per interface.
- Organise by clearly bounded modules: **Identity & Access; Sites & Assets; Device Ingestion; Sensor Readings; Rules & Alerts; Incident & Maintenance; SMS Communications; Dashboard; Reporting & Evaluation; Audit & Administration.** Use shared domain models, interfaces and services.
- Recommended stack: React/TypeScript responsive web/PWA, secure TypeScript backend/Edge Functions where suitable, SQL/PostgreSQL, C++ firmware on appropriate ESP32-based hardware. Change technologies only with a recorded technical reason.
- Devices do not receive privileged Supabase database credentials. They connect to an authenticated, rate-limited ingestion API, initially using HTTPS/cellular as appropriate. If scale warrants it, introduce an authenticated MQTT/TLS broker rather than treating Supabase as an MQTT broker.
- No duplicate business logic, unnecessary parallel apps, hardcoded production values, unreviewed temporary bypasses, abandoned feature paths or needless complexity.
- Desktop, smartphone and basic SMS phone are **interfaces to the same incident state**, not three independent systems.

## 4. Security, privacy and data protection by design

- Design for compliance with the Kenya Data Protection Act and applicable guidance; document lawful basis, collection purpose, retention, deletion, data-subject handling and responsible operational ownership before real-user deployment.
- Supabase Auth for people, role/site-scoped authorisation, Row Level Security on exposed tables, least-privilege server operations, and validated ownership on every read/write. Never weaken RLS as a shortcut or expose service-role keys, database secrets, SMS keys or device secrets in browser code, firmware repositories or slides.
- Each physical device has a distinct revocable identity. Authenticate and validate ingestion; reject unauthorised, malformed, duplicate, replayed or implausible readings. Keep timestamps, source, measurement units and device health.
- Encrypt communication in transit, use provider-managed encryption at rest and audit consequential user and system actions. Restrict personal information in SMS: normal SMS is **not end-to-end encrypted**.
- SMS replies must verify the sender, intended site and incident; use confirmation for closure and other consequential actions. SMS must never directly control a physical pump.
- Use minimum personal data necessary. Use Nicholas Kioko as an example profile only where authorised; do not expose personal contact details in public mockups, logs or broad notifications by default. Do not present official KRCS/county logos as evidence of an unconfirmed partnership.
- Before field deployment, conduct a documented security/privacy review and verify that only authorised users can see each site's data.

## 5. Physical devices, fault detection and resilience

- Select sensors against site-validated needs (for example level, flow, pump operating signal and solar/battery condition). Confirm measurement range, calibration, power, environmental rating, electrical isolation and required interfaces (e.g. pulse, 4–20 mA, RS485/Modbus); do not wire incompatible industrial signals directly to microcontroller pins.
- Use qualified field expertise for installations near pump power and water infrastructure. The initial project **monitors, warns and coordinates**; automatic remote pump actuation is out of scope unless separately designed, approved and safety-tested.
- Rules must distinguish a suspected fault from a confirmed diagnosis. Include plausibility checks, thresholds, sustained-duration rules, false-alarm controls, missing-data/device-health states and recovery verification.
- Provide local buffering with sequence numbers/timestamps, retry/backoff, idempotent ingestion and graceful reconnection. A cellular SMS-only feature phone needs no mobile internet, **but does require SMS network coverage**. If there is no cellular coverage, never promise remote delivery; preserve local events and surface failed/pending delivery states.
- Show the age of the last successful reading and a clear “connection lost / last updated” state. Never silently display stale data as live.

## 6. User-centred interface and approved brand

- Preserve the user-approved AquaSentinel logo, favicon, brand palette and established look. Do not redesign brand assets, invent alternate logos, randomly add colours, change typography or use irrelevant stock UI components without approval.
- Design first for a nontechnical water operator: plain-language status (Normal, Warning, Needs Attention, Offline), one obvious next action, readable numbers with units, explanatory charts, and simple instructions. Avoid developer jargon and crowded dashboards.
- Responsive across laptop, Android and iPhone; mobile has a visible, functional hamburger/sidebar. Buttons must have touch-friendly targets. Use accessible contrast, keyboard focus, labelled controls, readable text and do not convey urgent states by colour alone.
- Every consequential action shows confirmation/clear success or failure and updates the affected screens in the background without a full-page refresh. Do not promise sub-second performance without measurement.
- Show site, device, time zone and data freshness where relevant. All graphs must be understandable to a person unfamiliar with the engineering behind them.

## 7. One end-to-end operational workflow

1. **Normal:** Show verified/clearly simulated pump, flow, storage and power readings with source and freshness.
2. **Abnormal condition:** Introduce or measure a specified fault condition; distinguish field reading from demonstration input.
3. **Alert:** Validate a sustained rule, open an incident, record priority and queue the appropriate notification.
4. **Notify:** Send/log a suitable ordinary-language SMS and/or dashboard alert, with delivery result rather than presumed success.
5. **Acknowledge:** Authorised operator acknowledges; update the single authoritative incident and audit history.
6. **Assign and inspect:** Record responsible technician, diagnosis and action, without claiming a suspected cause is confirmed.
7. **Recover:** Check restored telemetry or qualified manual verification; then close with confirmation and reason.
8. **Learn:** Retain traceable incident history, maintenance actions, response metrics and cost/evaluation records.

No part of the platform should display incompatible states after an SMS response, dashboard action or reconnection. Preserve incident context through retries, offline periods and refreshes.

## 8. Evidence, truth and research integrity

- Clearly mark all mockups, demonstration values, simulated SMS and scripted incidents as **SIMULATED**. Never invent deployments, partnerships, quotations, user adoption, performance percentages or measured community impact.
- Before a real pilot, document site assessment, baseline, consent/governance arrangements, sensor calibration, test cases, alert thresholds and acceptance criteria. Distinguish proposed targets from observed outcomes.
- Report false positives, missed events, outages, sample size and limitations alongside positive results. Preserve source and time of every measurement and meaningful change.
- Evaluate whether system improvements lead to practical water-service reliability outcomes, not merely whether a dashboard renders or an alert fires.

## 9. Pilot financial and operational discipline

- Current pitch allocation is an **indicative KES 350,000** pilot estimate; do not state it has been funded, procured or validated. The proposed two sites remain conditional upon field conditions and supplier quotations.
- Prepare an itemised Bill of Materials and quotations for equipment, power, enclosure, installation, SIM/SMS, hosting, training, field visits, spares, repairs and contingency; include recurring costs and responsible payer.
- If the budget cannot safely deliver two sites, prioritise one representative site and obtain explicit approval before promising expansion. Avoid transferring unfunded work or liabilities to the community.
- Define local ownership, training, spare-part sourcing, maintenance handover and support arrangements; county/KRCS participation is prospective unless formally confirmed.

## 10. Delivery gates and change control

- **Gate A — Requirements:** Map each feature and user journey to KRCS criteria and intended operator needs; approve scope and data-flow/security plan.
- **Gate B — Interactive demonstration:** Normal → fault → alert → SMS reply → assigned repair → verified recovery → report, fully functioning with simulated data and truthful labels.
- **Gate C — Hardware integration:** Bench-test real sensor input, device identity, telemetry validation, local fault logic and transport recovery.
- **Gate D — SMS and field readiness:** Test provider integration, actual SMS delivery/replies, cellular/offline behaviour, security review and installation safety.
- **Gate E — Pilot:** Conduct approved field deployment, training, baseline capture, evaluation and cost validation.
- **Gate F — Expansion:** Proceed only on credible evidence of technical usefulness, user acceptance, affordability and maintainability.
- Keep automated tests for core workflows, permissions, device ingestion, rule evaluation, idempotency, offline recovery and responsive UI. Perform manual end-to-end tests using the actual intended user roles and devices. Record results and do not repeat already verified work unnecessarily.
- Use descriptive code, focused changes and clear documentation. Document deviations, risks and outstanding assumptions. Do not request production secrets before the work actually requires them.

## 11. Presentation and project boundaries

- When preparing a KRCS pitch, keep **exactly five required topics in order**: Background Context; Problem Statement; Solution; Budget; Sustainability Plan. Respect the stated 10-minute presentation and 5-minute Q&A window; put technical detail in speaker notes or supplementary material, not additional slides.
- Do not misrepresent product screens as real sensor telemetry or imply KRCS/Makueni County endorsement without permission. Follow the supplied template's licensing and credit obligations.
- AquaSentinel is independent. **Do not access, inspect or modify Lovable, ShiftNex or unrelated projects/accounts** for AquaSentinel without the owner's explicit instruction.
- Any external service connection, live SMS send, database write, deployment, financial commitment or other consequential action must be authorised and visibly confirmed.

---

**Working principle:** Build for the person managing the water system. Judges' criteria are acceptance tests; community usability, technical truth, security, measurable value and long-term affordability determine whether AquaSentinel is ready to advance.
