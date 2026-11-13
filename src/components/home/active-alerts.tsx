import Link from "next/link";
import { ArrowRight, ChevronRight, CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IncidentSummary, Member } from "@/lib/data/types";
import { formatSiteTime } from "@/lib/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/incidents";

/** Compact list: what, when, status and who is responsible. */
export function ActiveAlerts({ active, members, timezone }: { active: IncidentSummary[]; members: Member[]; timezone: string }) {
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-base font-semibold">Active alerts ({active.length})</h2>
        <Link href="/incidents" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {active.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 pt-2 text-sm text-ink-muted">
          <CircleCheck className="size-4 text-ok" aria-hidden />
          No active alerts. Water is flowing as expected.
        </p>
      ) : (
        <ul className="divide-y divide-line px-2 pb-2 pt-1">
          {active.slice(0, 4).map((i) => {
            const Icon = i.severity === "needs_attention" ? OctagonAlert : TriangleAlert;
            const who = members.find((m) => m.user_id === i.assigned_to)?.full_name;
            return (
              <li key={i.id}>
                <Link href={`/incidents/${i.id}`} className="flex min-h-16 items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-muted">
                  <span className={i.severity === "needs_attention" ? "grid size-9 shrink-0 place-items-center rounded-xl bg-crit-soft text-crit" : "grid size-9 shrink-0 place-items-center rounded-xl bg-warn-soft text-warn"}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.title}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {formatSiteTime(i.detected_at, timezone)} · {who ?? "Unassigned"}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                  <ChevronRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
