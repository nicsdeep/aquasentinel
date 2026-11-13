import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LatestReading } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";
import { METRIC_ORDER, describeReading, localHour } from "@/lib/readings";
import { TONE_CLASSES } from "@/lib/status";
import { cn } from "@/lib/cn";

const STALE_SECONDS = 15 * 60;

/** Five readings, each with value + unit, a plain one-word state and its age. Stale data is greyed, never shown as live. */
export function ReadingCards({ latest, timezone, now }: { latest: LatestReading[]; timezone: string; now: number }) {
  const hour = localHour(timezone, new Date(now));
  const readings = METRIC_ORDER.map((m) => latest.find((r) => r.metric === m)).filter((r): r is LatestReading => !!r);

  if (readings.length === 0) {
    return <p className="rounded-card border border-line bg-surface p-5 text-ink-muted">No readings received yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {readings.map((r) => {
        const view = describeReading(r, latest, hour);
        const age = secondsSince(r.measured_at, now);
        const stale = age == null || age > STALE_SECONDS;
        const Icon = view.icon;
        return (
          <li
            key={r.metric}
            className={cn(
              "flex flex-col rounded-card border border-line bg-surface p-4 shadow-card",
              r.metric === "pump_running" && "col-span-2 lg:col-span-1",
              stale && "opacity-60",
            )}
            title={view.explanation}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn("grid size-9 place-items-center rounded-xl", TONE_CLASSES[stale ? "off" : view.tone])}>
                <Icon className="size-5" aria-hidden />
              </span>
              <Badge tone={stale ? "off" : view.tone}>{stale ? "May be out of date" : view.state}</Badge>
            </div>
            <p className="mt-3 text-sm font-medium text-ink-muted">{view.label}</p>
            <p className="tabular text-2xl font-bold text-ink">
              {view.value}
              {view.unit && <span className="ml-1 text-base font-semibold text-ink-muted">{view.unit}</span>}
            </p>
            <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-ink-subtle">
              <Clock className="size-3" aria-hidden />
              {formatAge(age)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
