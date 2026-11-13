"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Cpu, Droplets, Gauge, MapPin, Power, Sun, type LucideIcon } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useSiteData } from "@/lib/data/site-data";
import type { IncidentStatus, Severity } from "@/lib/data/types";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/incidents";
import { METRIC_ORDER, describeReading, localHour } from "@/lib/readings";
import { getSupabase } from "@/lib/supabase/client";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";
import { HistoryChart } from "./history-chart";

const ASSET_ICON: Record<string, LucideIcon> = { intake_pump: Power, pipeline: Gauge, storage_tank: Droplets, solar_power: Sun, monitoring_unit: Cpu };
const STALE_SECONDS = 15 * 60;

interface RecentIncident {
  id: string;
  reference: string;
  title: string;
  status: IncidentStatus;
  severity: Severity;
  detected_at: string;
}

/** Everything about one water system: live readings, history, the infrastructure it watches, and its record. */
export function SiteView() {
  const now = useNow();
  const { data } = useSiteData();
  const [recent, setRecent] = useState<RecentIncident[]>([]);
  const siteId = data?.site.site_id;

  useEffect(() => {
    if (!siteId) return;
    getSupabase()!
      .from("incidents")
      .select("id, reference, title, status, severity, detected_at")
      .eq("site_id", siteId)
      .order("detected_at", { ascending: false })
      .limit(8)
      .then(({ data: rows }) => setRecent((rows ?? []) as RecentIncident[]));
  }, [siteId, data?.active.length]);

  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" aria-label="Loading" />;
  const { site } = data;
  const hour = localHour(site.timezone, new Date(now));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Site</Eyebrow>
          <h1 className="type-h1 mt-2">{site.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="size-4" aria-hidden />
            {site.location}
          </p>
          {site.description && <p className="mt-2 max-w-2xl text-sm text-ink-muted">{site.description}</p>}
        </div>
        <StatusBadge status={site.status} size="lg" />
      </header>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <h2 className="px-5 pt-5 text-base font-semibold">Readings now</h2>
        <table className="mt-2 w-full text-sm">
          <thead className="sr-only md:not-sr-only">
            <tr className="border-b border-line text-left text-xs text-ink-subtle">
              <th className="px-5 py-2 font-medium">Reading</th>
              <th className="px-2 py-2 font-medium">Value</th>
              <th className="hidden px-2 py-2 font-medium md:table-cell">What it means</th>
              <th className="px-5 py-2 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {METRIC_ORDER.map((m) => data.latest.find((r) => r.metric === m)).filter((r) => !!r).map((r) => {
              const v = describeReading(r!, data.latest, hour);
              const age = secondsSince(r!.measured_at, now);
              const stale = age == null || age > STALE_SECONDS;
              const Icon = v.icon;
              return (
                <tr key={r!.metric} className={cn("border-b border-line last:border-0", stale && "opacity-60")}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-accent" aria-hidden />
                      {v.label}
                    </span>
                  </td>
                  <td className="tabular px-2 py-3">
                    <span className="font-semibold">{v.value}</span> <span className="text-ink-muted">{v.unit}</span>
                    <Badge tone={stale ? "off" : v.tone} className="ml-2">{stale ? "May be out of date" : v.state}</Badge>
                  </td>
                  <td className="hidden px-2 py-3 text-ink-muted md:table-cell">{v.explanation}</td>
                  <td className="px-5 py-3 text-right text-xs text-ink-subtle">{formatAge(age)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <HistoryChart history={data.history} timezone={site.timezone} />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-base font-semibold">Infrastructure</h2>
          <p className="text-sm text-ink-muted">Existing community assets that AquaSentinel watches and helps maintain.</p>
          <ul className="mt-2 divide-y divide-line">
            {data.assets.map((a) => {
              const Icon = ASSET_ICON[a.kind] ?? Cpu;
              return (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    {a.details.note && <p className="text-xs text-ink-muted">{a.details.note}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-5">
          {data.devices.map((d) => (
            <section key={d.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">{d.name}</h2>
                <Badge tone={d.connection === "online" ? "ok" : "off"}>{d.connection === "online" ? "Online" : d.connection === "revoked" ? "Revoked" : "Offline"}</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-ink-muted">Last report</dt>
                  <dd className="font-medium">{d.last_seen_at ? `${formatAge(secondsSince(d.last_seen_at, now))}` : "Never"}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Reports every</dt>
                  <dd className="font-medium">5 minutes</dd>
                </div>
              </dl>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-accent">Inspect data source</summary>
                <p className="mt-2 text-ink-muted">
                  {d.is_simulated
                    ? "Source: generated by the platform (demonstration environment). Readings pass the same validation and rules as a field sensor."
                    : "Source: field sensor, authenticated with its own device key."}
                </p>
              </details>
            </section>
          ))}

          <section className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between px-5 pt-5">
              <h2 className="text-base font-semibold">Recent incidents</h2>
              <Link href="/incidents?tab=closed" className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">History</Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-muted">No incidents recorded yet.</p>
            ) : (
              <ul className="divide-y divide-line px-2 pb-2">
                {recent.map((i) => (
                  <li key={i.id}>
                    <Link href={`/incidents/${i.id}`} className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-muted">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.title}</p>
                        <p className="text-xs text-ink-muted">{i.reference} · {formatSiteTime(i.detected_at, site.timezone)}</p>
                      </div>
                      <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                      <ChevronRight className="size-4 text-ink-subtle" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      {site.status === "offline" && (
        <Card className="p-5 text-sm text-ink-muted">No reading for over 15 minutes. Values above may be out of date.</Card>
      )}
    </div>
  );
}
