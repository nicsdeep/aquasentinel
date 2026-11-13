"use client";

import Link from "next/link";
import { ChevronRight, OctagonAlert, TriangleAlert, UserRound } from "lucide-react";
import { IncidentActions } from "@/components/incidents/incident-actions";
import type { Role } from "@/lib/auth/session";
import type { IncidentSummary, Member } from "@/lib/data/types";
import { useIncident } from "@/lib/data/use-incident";
import { SEVERITY, STATUS_LABEL, evidenceText } from "@/lib/incidents";
import { TONE_CLASSES } from "@/lib/status";
import { cn } from "@/lib/cn";

function nextLine(i: IncidentSummary, role: Role, userId: string, responsible: string | null) {
  const manager = role !== "technician";
  switch (i.status) {
    case "open":
      return "Acknowledge it so the team knows someone is on it.";
    case "acknowledged":
      return manager ? "Assign a technician to inspect." : "Take the job if you can get there.";
    case "assigned":
      return i.assigned_to === userId
        ? i.diagnosis ? "Confirm the water is flowing again." : "Inspect and record what you find."
        : `${responsible ?? "The technician"} is inspecting. You'll be told when water is flowing again.`;
    case "recovered":
      return manager ? "Water is flowing again. Close the incident with a reason." : "Water is flowing again. The operator will close it.";
    default:
      return "";
  }
}

/** The most urgent incident, who is responsible, and the one thing to do now (a working action, not a link). */
export function NextStep({ incident, more, members, role, userId }: { incident: IncidentSummary; more: number; members: Member[]; role: Role; userId: string }) {
  const { incident: detail, technicians, reload } = useIncident(incident.id);
  const sev = SEVERITY[incident.severity];
  const Icon = incident.severity === "needs_attention" ? OctagonAlert : TriangleAlert;
  const responsible = members.find((m) => m.user_id === incident.assigned_to)?.full_name ?? null;

  return (
    <section className={cn("rounded-3xl border border-current/15 p-5 md:p-6", TONE_CLASSES[sev.tone])} aria-label="Needs your attention">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 size-7 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="type-eyebrow">
            {sev.label} · {incident.reference} · {STATUS_LABEL[incident.status]}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-ink md:text-2xl">{incident.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{evidenceText(incident.evidence)}</p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink">
            <UserRound className="size-4 text-ink-muted" aria-hidden />
            {responsible ? <>Responsible: <strong className="font-semibold">{responsible}</strong></> : "No technician assigned yet"}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">Next: {nextLine(incident, role, userId, responsible)}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {detail && <IncidentActions incident={detail} role={role} userId={userId} technicians={technicians} onDone={reload} mode="next" />}
            <Link href={`/incidents/${incident.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
              View details
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
          {more > 0 && <p className="mt-3 text-xs text-ink-muted">+{more} more open · see Alerts &amp; incidents</p>}
        </div>
      </div>
    </section>
  );
}
