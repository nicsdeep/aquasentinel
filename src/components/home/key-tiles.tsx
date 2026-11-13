import { Clock } from "lucide-react";
import type { LatestReading, Metric } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";
import { describeReading, localHour } from "@/lib/readings";
import { TONE_CLASSES } from "@/lib/status";
import { cn } from "@/lib/cn";

const STALE_SECONDS = 15 * 60;
const TILES: Metric[] = ["flow_rate", "tank_level", "pump_running", "solar_power"];

/** The four readings an operator checks first. Battery is a sub-line of Solar. Stale tiles are greyed, never shown as live. */
export function KeyTiles({ latest, timezone, now }: { latest: LatestReading[]; timezone: string; now: number }) {
  const hour = localHour(timezone, new Date(now));
  const battery = latest.find((r) => r.metric === "battery_voltage");
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {TILES.map((metric) => {
        const r = latest.find((x) => x.metric === metric);
        if (!r) {
          return (
            <li key={metric} className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
              No reading yet
            </li>
          );
        }
        const view = describeReading(r, latest, hour);
        const age = secondsSince(r.measured_at, now);
        const stale = age == null || age > STALE_SECONDS;
        const Icon = view.icon;
        const sub =
          metric === "solar_power" && battery ? `Battery ${battery.value.toFixed(1)} V` : stale ? "May be out of date" : view.state;
        return (
          <li key={metric} className={cn("flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card", stale && "opacity-60")} title={view.explanation}>
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", TONE_CLASSES[stale ? "off" : view.tone])}>
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">{view.label}</p>
              <p className="tabular text-xl font-semibold leading-tight text-ink md:text-2xl">
                {view.value}
                {view.unit && <span className="ml-1 text-sm font-medium text-ink-muted">{view.unit}</span>}
              </p>
              <p className={cn("mt-0.5 text-xs", !stale && view.tone === "crit" ? "font-medium text-crit" : !stale && view.tone === "warn" ? "font-medium text-warn" : "text-ink-subtle")}>
                {sub}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-subtle">
                <Clock className="size-3" aria-hidden />
                {formatAge(age)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
