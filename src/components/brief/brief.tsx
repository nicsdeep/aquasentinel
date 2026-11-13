import Link from "next/link";
import { CircleCheck, CircleDashed } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

/** IFSL brief §3.2 problems → what AquaSentinel does about each, with where to see it. */
const PROBLEMS = [
  {
    problem: "Unreliable pumping systems",
    response: "A rule watches the pump and the flow together. Pump running with no flow for 10 minutes opens an urgent incident; reduced flow opens a warning.",
    where: "/dashboard",
  },
  {
    problem: "Solar downtimes",
    response: "Solar output and battery voltage are monitored. Low solar output during daylight raises a warning before the pump stops.",
    where: "/dashboard",
  },
  {
    problem: "Ageing pipelines and inefficient conveyance",
    response: "Reduced flow while the pump runs is flagged as a suspected leak or blockage, with a recommended check.",
    where: "/dashboard",
  },
  {
    problem: "Lack of elevated water storage",
    response: "The storage level is tracked over 24 hours. A low-storage warning lets the operator tell water users early.",
    where: "/dashboard",
  },
  {
    problem: "Limited local technical capacity",
    response: "Every alert says, in plain words, the suspected cause and what to do. A local technician is assigned and guided step by step.",
    where: "/incidents",
  },
  {
    problem: "Remote location, far from service providers",
    response: "Alerts and replies work by SMS on any basic phone, with no internet. The first response is local, before outside help is called.",
    where: "/dashboard",
  },
  {
    problem: "No structure to oversee the infrastructure",
    response: "A water committee role sees every incident, response time and repair. Every action is recorded with who, when and how.",
    where: "/incidents",
  },
  {
    problem: "Neglect and corrosion over time",
    response: "Each fault, finding, repair, cost and recovery becomes a maintenance record, so the next failure can be prevented.",
    where: "/incidents",
  },
];

/** The 8 KRCS selection criteria (§4.2.1) → evidence a judge can check in the product. */
const CRITERIA = [
  { name: "Relevance and problem fit", evidence: "Built directly from §3.2 (Ngomano). Every alert rule names the problem it addresses." },
  { name: "Innovation and differentiation", evidence: "Not a new sensor: one loop joining monitoring, plain-language rules, SMS response and accountable records, designed for low connectivity and local repair." },
  { name: "Technical feasibility", evidence: "Running in production now, with automated tests on every change (including 32 database tests), validated device ingestion and continuous deployment." },
  { name: "Data protection and security", evidence: "Site-scoped access (row-level security), least privilege, masked phone numbers, hashed device keys, a full audit log and minimal personal data. No personal data in SMS, which is not end-to-end encrypted." },
  { name: "Impact potential and risk", evidence: "Response time, downtime, false alarms and completed repairs are measured from the record. Named risks: sensor failure, connectivity, power, false alarms, digital literacy and sustained ownership." },
  { name: "Scalability and sustainability", evidence: "One data model from site to county. Low running costs, local technicians at the centre, and expansion only after pilot evidence." },
  { name: "Team capacity", evidence: "Solo founder and software engineer (Nicholas Kioko) building the full platform. Installation by qualified local technicians; hardware and water-operations expertise to be engaged for the pilot." },
  { name: "Inclusivity and equity", evidence: "Works on basic phones by SMS in English or Kiswahili. Plain language, large touch targets, readable contrast. Women and youth to be engaged in co-design during the pilot." },
];

const LIVE = [
  "Web and mobile app (this site), sign-in and roles",
  "Readings validation, alert rules and site status",
  "Incident workflow: acknowledge, assign, findings, recovery, close",
  "SMS alerts and replies (1 · 2 · 3 · YES) in English and Kiswahili",
  "Audit history and maintenance records",
];
const NEXT = [
  "Field sensors at the site, replacing the virtual unit (Gate C)",
  "SMS provider connection for real phones (Gate D)",
  "Baseline, community co-design and pilot evaluation (Gate E)",
];

export function Brief() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <Eyebrow>IFSL Digital Innovation Challenge</Eyebrow>
        <h1 className="type-h1 mt-2">How AquaSentinel meets the brief</h1>
        <p className="mt-2 text-ink-muted">
          AquaSentinel helps a community keep the water system it already has working. It detects faults early,
          gets them to a local technician, and records every repair. It monitors, warns and coordinates. It does not
          control pumps, replace repairs, create water or guarantee water safety.
        </p>
      </header>

      <Card>
        <CardHeader title="The problems in the brief (§3.2) and what AquaSentinel does" />
        <ul className="divide-y divide-line px-5 pb-2">
          {PROBLEMS.map((p) => (
            <li key={p.problem} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
              <p className="font-semibold text-ink">{p.problem}</p>
              <p className="text-sm text-ink-muted">
                {p.response}{" "}
                <Link href={p.where} className="font-medium text-info underline underline-offset-2">See it</Link>
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="The 8 selection criteria and the evidence" />
        <ol className="divide-y divide-line px-5 pb-2">
          {CRITERIA.map((c, i) => (
            <li key={c.name} className="flex gap-4 py-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-as-dark text-sm font-bold text-white">{i + 1}</span>
              <div>
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="text-sm text-ink-muted">{c.evidence}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Live now" />
          <ul className="space-y-2 p-5 text-sm">
            {LIVE.map((l) => (
              <li key={l} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />{l}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Next" />
          <ul className="space-y-2 p-5 text-sm">
            {NEXT.map((n) => (
              <li key={n} className="flex gap-2"><CircleDashed className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />{n}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 text-sm text-ink-muted">
        <p>
          <span className="font-semibold text-ink">Data source.</span> Readings currently come from a virtual monitoring
          unit (MU-01) that behaves like a field device and uses the same validation and rules. Field sensors replace it at
          installation; nothing else in the system changes.
        </p>
        <p className="mt-2">
          <span className="font-semibold text-ink">Pilot budget.</span> Indicative KES 350,000, to be confirmed by field
          assessment and supplier quotations.
        </p>
        <p className="mt-2">
          <span className="font-semibold text-ink">Independence.</span> AquaSentinel is an independent project. No
          partnership with any organisation is claimed.
        </p>
      </Card>
    </div>
  );
}
