"use client";

import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Lightbulb, Search, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Phone } from "@/components/sms/phone";
import { useSession } from "@/lib/auth/session";
import { useIncident } from "@/lib/data/use-incident";
import { formatSiteTime } from "@/lib/format";
import { LIFECYCLE, OUTCOME_LABEL, SEVERITY, STATUS_LABEL, STATUS_TONE, evidenceText } from "@/lib/incidents";
import { cn } from "@/lib/cn";
import { IncidentActions } from "./incident-actions";
import { Timeline } from "./timeline";

function minutesBetween(a: string | null, b: string | null) {
  if (!a || !b) return null;
  return Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 60000));
}

export function IncidentDetailView({ id }: { id: string }) {
  const session = useSession();
  const { incident, timeline, technicians, missing, reload } = useIncident(id);

  if (session.status !== "signed_in") return null;
  if (missing) {
    return (
      <Card className="p-6">
        <p className="font-semibold">Incident not found.</p>
        <Link href="/incidents" className="mt-2 inline-block text-sm font-medium text-info underline">Back to incidents</Link>
      </Card>
    );
  }
  if (!incident) return <div className="h-64 animate-pulse rounded-card bg-surface-muted" aria-label="Loading" />;

  const membership = session.memberships.find((m) => m.siteId === incident.site_id);
  const tz = incident.site?.timezone ?? "Africa/Nairobi";
  const sev = SEVERITY[incident.severity];
  const step = LIFECYCLE.findIndex((l) => l.status === incident.status);
  const response = minutesBetween(incident.detected_at, incident.acknowledged_at);
  const downtime = minutesBetween(incident.detected_at, incident.recovered_at);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <Link href="/incidents" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          All incidents
        </Link>

        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {incident.status !== "closed" && <Badge tone={sev.tone}>{sev.label}</Badge>}
            <Badge tone={STATUS_TONE[incident.status]}>{STATUS_LABEL[incident.status]}</Badge>
            <span className="text-sm text-ink-muted">{incident.reference} · {incident.site?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{incident.title}</h1>
          <p className="text-ink-muted">{evidenceText(incident.evidence)}</p>
        </header>

        {/* Lifecycle: Detected → Acknowledged → Assigned → Recovered → Closed */}
        <ol className="grid grid-cols-5 gap-1.5" aria-label="Progress">
          {LIFECYCLE.map((l, i) => (
            <li key={l.status} className="text-center">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-teal-600" : "bg-line")} />
              <p className={cn("mt-1.5 text-[11px] font-medium sm:text-xs", i <= step ? "text-ink" : "text-ink-subtle")}>{l.label}</p>
            </li>
          ))}
        </ol>

        {membership && (
          <IncidentActions incident={incident} role={membership.role} userId={session.user.id} technicians={technicians} onDone={reload} />
        )}

        <Card>
          <CardHeader title="Why this alert" description={incident.rule?.explanation} />
          <dl className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <Search className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
              <div>
                <dt className="text-sm font-semibold">Suspected cause</dt>
                <dd className="text-sm text-ink-muted">{incident.evidence.suspected_cause}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
              <div>
                <dt className="text-sm font-semibold">Recommended action</dt>
                <dd className="text-sm text-ink-muted">{incident.evidence.recommended_action}</dd>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <BookOpenCheck className="mt-0.5 size-5 shrink-0 text-teal-600" aria-hidden />
              <div>
                <dt className="text-sm font-semibold">Problem it addresses</dt>
                <dd className="text-sm text-ink-muted">{incident.rule?.problem_reference}</dd>
              </div>
            </div>
          </dl>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-subtle">
            Detected {formatSiteTime(incident.detected_at, tz)}. A suspected cause is not a diagnosis until a technician inspects it.
          </p>
        </Card>

        <Card>
          <CardHeader title="Maintenance record" />
          <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Technician</dt>
              <dd className="text-ink-muted">{incident.assignee?.full_name ?? "Not assigned yet"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Findings</dt>
              <dd className="text-ink-muted">
                {incident.diagnosis ? (
                  <>
                    {incident.diagnosis}{" "}
                    <Badge tone={incident.diagnosis_status === "confirmed" ? "ok" : "warn"}>
                      {incident.diagnosis_status === "confirmed" ? "Confirmed" : "Suspected"}
                    </Badge>
                  </>
                ) : "Not recorded yet"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Repair done</dt>
              <dd className="text-ink-muted">{incident.action_taken ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Cost</dt>
              <dd className="tabular text-ink-muted">{incident.repair_cost_kes != null ? `KES ${Number(incident.repair_cost_kes).toLocaleString("en-KE")}` : "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Response time</dt>
              <dd className="tabular text-ink-muted">{response != null ? `${response} min to acknowledge` : "Waiting"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Downtime</dt>
              <dd className="tabular text-ink-muted">
                {downtime != null
                  ? `${downtime} min, verified ${incident.recovery_method === "manual" ? "by technician" : "from readings"}`
                  : "Water not yet restored"}
              </dd>
            </div>
            {incident.outcome && (
              <div className="sm:col-span-2">
                <dt className="font-semibold">Outcome</dt>
                <dd className="text-ink-muted">{OUTCOME_LABEL[incident.outcome]}: {incident.close_reason}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <CardHeader title="History" description="Every step, who took it and through which channel." />
          <div className="p-5 pl-7">
            <Timeline entries={timeline} timezone={tz} />
          </div>
        </Card>
      </div>

      <aside className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Wrench className="size-4 text-ink-muted" aria-hidden />
          Respond by SMS
        </h2>
        <Phone userId={session.user.id} locale={session.profile?.locale ?? "en"} timezone={tz} />
      </aside>
    </div>
  );
}
