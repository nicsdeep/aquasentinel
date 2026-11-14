import { Clock, Waves } from "lucide-react";
import type { LatestReading, Metric } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";
import { describeReading, localHour } from "@/lib/readings";
import { TONE_CLASSES, type Tone } from "@/lib/status";
import { cn } from "@/lib/cn";

const STALE_SECONDS = 15 * 60;
const TILES: Metric[] = ["flow_rate", "tank_level", "pump_running", "solar_power"];

/**
 * A stopped pump in daylight is the moment an operator looks twice, so it reads red. At night a solar pump is
 * normally off, so it stays neutral: red every night would teach people to ignore red.
 */
function tileTone(metric: Metric, tone: Tone, hour: number): Tone {
  const daylight = hour >= 9 && hour < 16;
  if (daylight && (metric === "pump_running" || metric === "flow_rate") && tone === "off") return "crit";
  return tone;
}

/** The four readings an operator checks first. Battery is a sub-line of Solar. Stale tiles are greyed, never shown as live. */
export function KeyTiles({ latest, timezone, now }: { latest: LatestReading[]; timezone: string; now: number }) {
  const hour = localHour(timezone, new Date(now));
  const battery = latest.find((r) => r.metric === "battery_voltage");
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {TILES.map((metric) => {
        const r = latest.find((x) => x.metric === metric);
        if (!r) {
          return (
            <li key={metric} className="rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted">
              No reading yet
            </li>
          );
        }
        const view = describeReading(r, latest, hour);
        const age = secondsSince(r.measured_at, now);
        const stale = age == null || age > STALE_SECONDS;
        const tone: Tone = stale ? "off" : tileTone(metric, view.tone, hour);
        const Icon = metric === "flow_rate" ? Waves : view.icon;
        // The icon circle stays neutral for flow (as in the reference design); its pill carries the state.
        const iconTone: Tone = metric === "flow_rate" ? "off" : tone;
        return (
          <li
            key={metric}
            className={cn("card-wave flex gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card md:gap-4 md:p-5", stale && "opacity-60")}
            title={view.explanation}
          >
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-full md:size-14", TONE_CLASSES[iconTone])}>
              <Icon className="size-5 md:size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink md:text-[15px]">{view.label}</p>
              <p className="tabular text-xl font-bold leading-tight text-ink md:text-[26px]">
                {view.value}
                {view.unit && <span className="ml-1 text-base font-medium text-ink md:text-xl">{view.unit}</span>}
              </p>
              {metric === "solar_power" && battery ? (
                <p className="mt-1 text-sm text-ink-muted md:text-[15px]">Battery {battery.value.toFixed(1)} V</p>
              ) : (
                <span className={cn("mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold", TONE_CLASSES[tone])}>
                  {stale ? "May be out of date" : view.state}
                </span>
              )}
              <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
                <Clock className="size-3.5" aria-hidden />
                {formatAge(age)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
