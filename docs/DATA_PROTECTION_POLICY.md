# AquaSentinel data protection policy (internal)

**Version 1.1 · 16 November 2026 · Owner: AquaSentinel (contact info@aquasentinel.com)**

This is the internal rulebook behind the public trust & legal centre (`/legal`): Privacy Notice (`/privacy`),
Terms of Use (`/terms`), Cookies (`/cookies`) and Security (`/security`), all in English and Kiswahili, with texts in
[`src/lib/legal/content.ts`](../src/lib/legal/content.ts). It shows how AquaSentinel meets IFSL criterion 4 ("The
solution must comply with data protection regulations (data security)") and PROJECT_RULES §4, under the **Kenya Data
Protection Act, 2019** (the Act) and its regulations. Every public statement must match this document and the code;
update all three together.

> This policy is a practical reading of the Act, not legal advice. Items marked **Before pilot** must be confirmed
> with the county's legal or ICT office, or against ODPC guidance, before real users are added.

## 1. Roles
| Role | Who | Responsibility |
|---|---|---|
| Data controller | AquaSentinel | Decides purposes and means; answers requests; notifies breaches. |
| Data protection contact | info@aquasentinel.com | Receives privacy questions and data-subject requests. |
| Processors | Supabase (database, auth; EU, France), Vercel (web hosting), licensed SMS provider (when SMS is enabled) | Process data under contract, for AquaSentinel only. |
| Site partners | Water committee / county office for each site | Agree who joins the team; use data only for that water system. **Before pilot:** confirm in a short written agreement whether they act as joint controller. |

## 2. Data inventory (what the system actually stores)
| Data | Where (table) | Personal? | Purpose | Lawful basis (Act s.30) |
|---|---|---|---|---|
| Email, password hash | `auth.users` (Supabase Auth) | Yes | Sign-in | Performance of the service |
| Full name, language | `profiles.full_name`, `profiles.locale` | Yes | Show who acted; SMS language | Performance of the service |
| Mobile number (E.164) | `profiles.phone_e164` | Yes | Send alerts; verify SMS senders. Never shown in full | Performance of the service; consent when added |
| Role and site | `site_members` | Yes | Access control (RLS) | Performance of the service |
| Action trail | `audit_log` (actor, action, channel, time, details) | Yes | Accountability, maintenance history | Legitimate interest (reliable water supply); security |
| Reports and notes | `incidents.evidence` (`reported_by`, `note`), work records | Yes (free text) | Fault response | Legitimate interest |
| SMS log | `sms_messages` (masked number, body, status) | Yes | Delivery and audit of alerts | Performance of the service |
| Readings | `readings` | No | Monitoring | n/a |
| Device keys | `devices.key_hash` | No | Device identity | n/a |
| Sign-in cookie | Browser (Supabase Auth, `sb-…-auth-token`) | Technical | Keep a session | Strictly necessary |
| `as-messages-seen` | Browser localStorage | No | Unread-message dot | Strictly necessary |
| Technical logs | Supabase / Vercel (IP, user agent) | Yes | Security, troubleshooting | Legitimate interest; security |

**Not collected:** ID numbers, home locations, payment data, photos of people, sensitive personal data (Act s.2),
analytics or advertising identifiers. No analytics or tracking scripts; fonts are self-hosted.

## 3. Principles in practice (Act s.25)
- **Minimisation:** the fields above only. New personal fields need a recorded purpose and an update here and in the notice.
- **Purpose limitation:** data is used only to run, secure and improve the water-system service it was collected for. No sale, no advertising.
- **Accuracy:** users can ask for corrections; operators keep phone numbers current.
- **Storage limitation:** see §5.
- **Integrity and confidentiality:** see §4.
- **Transparency:** public notice in English and Kiswahili, linked from sign-in, the sidebar and search.

## 4. Security measures (implemented)
- Supabase Auth per person; role- and site-scoped authorisation; **row level security** on every public table,
  tested by pgTAP in CI (`supabase/tests/`) and checked by `npm run db:check-rls`.
- All writes go through SECURITY DEFINER SQL functions that check membership and role.
- HTTPS everywhere; provider-managed encryption at rest.
- `audit_log` written by a trigger for every consequential action (actor, channel web/SMS/system, time).
- Phone numbers masked in the SMS log and UI. SMS bodies contain no sensitive personal data; closing by SMS needs a YES confirmation; SMS never controls a pump.
- Distinct, revocable device keys (hashed); replayed, duplicate, malformed or implausible readings rejected.
- No secrets in client code or the repo; GitHub secret scanning and push protection on; production changes only through the release pipeline.
- Demo accounts use `example.com` addresses and no real phone numbers.

## 5. Retention schedule (committed in the public notice)
| Data | Keep | Then |
|---|---|---|
| Account details, phone | While a team member | Delete or anonymise within **30 days** of being told someone left |
| Incident and maintenance records | Up to **5 years** | Anonymise (name → role) after the person leaves; delete after 5 years |
| SMS log | Up to **12 months** | Delete |
| Provider technical logs | Provider default | Provider deletes |

**Gap (before pilot):** retention is applied by an administrator today. There is no automated job yet. Add a
reviewed, tested retention migration (non-destructive anonymisation first) before real users join, and record each
manual deletion in the audit log.

## 6. Data-subject requests (Act s.26)
1. Receive the request at info@aquasentinel.com (or from the site committee).
2. Verify identity: the request comes from the registered email or phone, or is confirmed by the committee.
3. Act: provide a copy (access), correct, delete or anonymise, or stop SMS (objection). Record the action in the audit log.
4. Reply in plain language, in the requester's language, **promptly and within the period the Data Protection (General)
   Regulations, 2021 require** (**before pilot:** confirm the exact period and write it here).
5. If the request is refused (for example, a repair record must be kept), explain why and mention the right to complain to ODPC.

## 7. Breach response (Act s.43)
1. Contain: revoke affected keys or sessions, rotate secrets, block access.
2. Assess: what data, how many people, what risk.
3. Notify the **ODPC within 72 hours** of becoming aware, when there is a real risk to people.
4. Tell affected people without undue delay, with advice on what to do.
5. Record the incident, its cause and the fix; review this policy.

## 8. Cross-border transfer (Act s.48–50)
The database is in the EU (France) and web hosting is global (Vercel). Safeguards: providers' data processing terms
and security certifications. **Before pilot:** keep copies of the providers' data processing agreements, and confirm
with the county whether EU hosting is acceptable or whether an African region is preferred.

## 9. Registration and assessments
- **Before pilot:** check whether AquaSentinel (and any site partner) must register with ODPC under the Data
  Protection (Registration of Data Controllers and Data Processors) Regulations, 2021, and register if required.
- **Before pilot:** run a short data protection impact assessment, and complete the documented security and privacy
  review that PROJECT_RULES §4 requires before field deployment.

## 10. Cookies
Only strictly necessary storage (§2). Therefore no consent banner. Adding any analytics, tracking or third-party
script requires updating this policy and the notice first, and a consent mechanism if it is not strictly necessary.

## 11. Before-pilot checklist
- [ ] Written agreement with the water committee or county (roles, joint controller or not).
- [ ] Kiswahili notice reviewed by community members.
- [ ] Consent recorded when each team member is added (who, when, which notice version).
- [ ] Exact data-subject response period confirmed (§6).
- [ ] ODPC registration checked (§9); DPIA done.
- [ ] Hosting region decision (§8) and providers' DPAs filed.
- [ ] Automated, tested retention job (§5).
- [ ] Security and privacy review signed off; exposed credentials rotated.
- [ ] info@aquasentinel.com mailbox live and monitored.
