import Link from "next/link";
import {
  ArrowRight, ChevronRight, CircleCheck, Droplet, Droplets, Power, Sun, TriangleAlert, Waves, WifiOff, type LucideIcon,
} from "lucide-react";
import type { Evidence, IncidentSummary, Member } from "@/lib/data/types";
import { evidenceText, STATUS_LABEL } from "@/lib/incidents";
import { cn } from "@/lib/cn";

/** An icon that says what kind of problem it is, from the incident's evidence (rule metric or reported category). */
export function incidentIcon(e: Evidence & { metric?: string }): LucideIcon {
  if (e.kind === "no_data") return WifiOff;
  const key = e.category ?? e.metric ?? "";
  if (key === "pump_stopped" || key === "pump_running" || e.kind === "pump_on_no_flow") return Power;
  if (key === "flow_rate" || key === "no_water" || e.kind === "pump_on_low_flow") return Waves;
  if (key === "leak") return Droplets;
  if (key === "tank_level" || key === "storage") return Droplet;
  if (key === "solar_power" || key === "battery_voltage" || key === "solar") return Sun;
  return TriangleAlert;
}

/** What is wrong, in words, with who is responsible. Most urgent first. */
export function ActiveAlerts({ active, members }: { active: IncidentSummary[]; members: Member[] }) {
  const sorted = [...active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  );
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <TriangleAlert className={cn("size-6", active.length ? "text-crit" : "text-ok")} aria-hidden />
          Active alerts ({active.length})
        </h2>
        <Link href="/incidents" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {active.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 pt-1 text-sm text-ink-muted">
          <CircleCheck className="size-4 text-ok" aria-hidden />
          No active alerts. Water is flowing as expected.
        </p>
      ) : (
        <ul className="space-y-2 px-4 pb-4 pt-1">
          {sorted.slice(0, 3).map((i) => {
            const crit = i.severity === "needs_attention";
            const Icon = incidentIcon(i.evidence as Evidence & { metric?: string });
            const who = members.find((m) => m.user_id === i.assigned_to)?.full_name;
            return (
              <li key={i.id}>
                <Link
                  href={`/incidents/${i.id}`}
                  className={cn("flex min-h-16 items-center gap-3 rounded-xl px-3 py-3 transition-colors", crit ? "bg-crit-soft hover:bg-crit-soft/70" : "bg-warn-soft hover:bg-warn-soft/70")}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-full bg-surface/70", crit ? "text-crit" : "text-warn")}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-ink">{i.title}</p>
                    <p className="text-sm text-ink-muted">{evidenceText(i.evidence)}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {STATUS_LABEL[i.status]} · {who ?? "Unassigned"}
                    </p>
                  </div>
                  <ChevronRight className={cn("size-5 shrink-0", crit ? "text-crit" : "text-warn")} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
