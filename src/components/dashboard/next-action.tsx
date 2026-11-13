import Link from "next/link";
import { ChevronRight, CircleCheck, OctagonAlert, TriangleAlert, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IncidentSummary, SiteRow } from "@/lib/data/types";
import { SEVERITY, STATUS_LABEL, evidenceText } from "@/lib/incidents";
import { TONE_CLASSES } from "@/lib/status";
import { cn } from "@/lib/cn";

const NEXT_STEP: Record<string, string> = {
  open: "Acknowledge the alert so the community knows someone is on it.",
  acknowledged: "Assign a technician to inspect.",
  assigned: "Technician inspects, records what was found, and restores flow.",
  recovered: "Water is flowing again. Close the incident with a reason.",
};

/**
 * One obvious next action (PROJECT_RULES §6). Shows the most urgent open incident and exactly what to do next;
 * otherwise confirms that all is well or that data has stopped arriving.
 */
export function NextAction({ site, active }: { site: SiteRow; active: IncidentSummary[] }) {
  const incident = [...active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  )[0];

  if (incident) {
    const sev = SEVERITY[incident.severity];
    const Icon = incident.severity === "needs_attention" ? OctagonAlert : TriangleAlert;
    return (
      <Link
        href={`/incidents/${incident.id}`}
        className={cn("group block rounded-panel border border-current/20 p-5 transition-shadow hover:shadow-card md:p-6", TONE_CLASSES[sev.tone])}
      >
        <div className="flex items-start gap-4">
          <Icon className="mt-0.5 size-8 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-eyebrow">{sev.label}</span>
              <Badge tone="off" className="bg-surface/70 text-ink">{incident.reference} · {STATUS_LABEL[incident.status]}</Badge>
            </div>
            <p className="type-h2 mt-1">{incident.title}</p>
            <p className="mt-1 text-sm opacity-90">{evidenceText(incident.evidence)}</p>
            <p className="mt-3 text-sm font-semibold">Next: {NEXT_STEP[incident.status]}</p>
            {/* The one orange action on the dashboard. */}
            <span className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-as-orange px-5 text-sm font-medium text-white shadow-sm transition group-hover:brightness-95">
              Open incident
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
        {active.length > 1 && <p className="mt-3 text-xs font-medium opacity-80">+{active.length - 1} more open</p>}
      </Link>
    );
  }

  if (site.status === "offline") {
    return (
      <div className={cn("flex items-start gap-4 rounded-panel border border-current/20 p-5 md:p-6", TONE_CLASSES.off)}>
        <WifiOff className="size-8 shrink-0" aria-hidden />
        <div>
          <p className="type-h2">Offline</p>
          <p className="text-sm">No recent data from the site. Readings below may be out of date.</p>
          <p className="mt-2 text-sm font-semibold">Next: check the monitoring unit&apos;s power and mobile signal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4 rounded-panel border border-current/20 p-5 md:p-6", TONE_CLASSES.ok)}>
      <CircleCheck className="size-8 shrink-0" aria-hidden />
      <div>
        <p className="type-h2">Normal</p>
        <p className="text-sm">Water is flowing as expected. No action needed.</p>
      </div>
    </div>
  );
}
