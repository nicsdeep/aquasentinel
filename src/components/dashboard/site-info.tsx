import { Cpu, Droplets, Gauge, Power, Sun, type LucideIcon } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import type { AssetRow, DeviceRow } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";

const ASSET_ICON: Record<string, LucideIcon> = {
  intake_pump: Power,
  pipeline: Gauge,
  storage_tank: Droplets,
  solar_power: Sun,
  monitoring_unit: Cpu,
};

/**
 * The existing infrastructure AquaSentinel watches over (it improves and maintains it; it never replaces it),
 * and a truthful statement of where the readings come from.
 */
export function SiteInfo({ assets, devices, now }: { assets: AssetRow[]; devices: DeviceRow[]; now: number }) {
  return (
    <Card>
      <CardHeader title="Infrastructure monitored" description="Existing community assets. AquaSentinel watches and helps maintain them." />
      <ul className="divide-y divide-line px-5 pb-2 pt-2">
        {assets.map((a) => {
          const Icon = ASSET_ICON[a.kind] ?? Cpu;
          return (
            <li key={a.id} className="flex items-start gap-3 py-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{a.name}</p>
                {a.details.note && <p className="text-xs text-ink-muted">{a.details.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-line px-5 py-4 text-xs text-ink-muted">
        <p className="font-semibold text-ink">Data source</p>
        {devices.map((d) => (
          <p key={d.id} className="mt-0.5">
            {d.name}: {d.connection}, last report {formatAge(secondsSince(d.last_seen_at, now))}.
          </p>
        ))}
        <p className="mt-1">Field sensors replace the virtual unit at installation (Gate C); the rest of the system stays the same.</p>
      </div>
    </Card>
  );
}
