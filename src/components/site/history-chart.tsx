"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint, Metric } from "@/lib/data/types";
import { cn } from "@/lib/cn";

const SERIES: { metric: Metric; label: string; unit: string; domain: [number, number]; caption: string }[] = [
  { metric: "tank_level", label: "Storage", unit: "%", domain: [0, 100], caption: "How full storage is. It should rise while the solar pump runs by day and fall slowly at night." },
  { metric: "flow_rate", label: "Flow", unit: "m³/h", domain: [0, 16], caption: "Water moving from the river intake to storage. Zero at night is normal for a solar pump." },
  { metric: "solar_power", label: "Solar", unit: "kW", domain: [0, 3], caption: "Power from the solar panels. It peaks around midday; a flat line in daylight means a problem." },
];

/** One clear line at a time, with a sentence that says what "normal" looks like (PROJECT_RULES §6). */
export function HistoryChart({ history, timezone }: { history: HistoryPoint[]; timezone: string }) {
  const [metric, setMetric] = useState<Metric>("tank_level");
  const s = SERIES.find((x) => x.metric === metric)!;
  const data = history.filter((h) => h.metric === metric).map((h) => ({ t: Date.parse(h.measured_at), v: h.value }));
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Last 24 hours</h2>
        <div className="inline-flex rounded-full bg-surface-muted p-1" role="tablist" aria-label="Reading">
          {SERIES.map((x) => (
            <button
              key={x.metric}
              role="tab"
              aria-selected={metric === x.metric}
              onClick={() => setMetric(x.metric)}
              className={cn("min-h-9 rounded-full px-4 text-sm font-medium", metric === x.metric ? "bg-surface text-ink shadow-sm" : "text-ink-muted")}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-muted">{s.caption}</p>
      <div className="mt-3 h-60 md:h-72" role="img" aria-label={`${s.label} over the last 24 hours`}>
        {data.length < 2 ? (
          <p className="grid h-full place-items-center text-sm text-ink-muted">Not enough readings yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#59c3c3" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#59c3c3" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} scale="time" tickFormatter={(t: number) => time.format(t)} tick={{ fill: "var(--ink-subtle)", fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={40} />
              <YAxis domain={s.domain} unit={s.unit === "%" ? "%" : ""} tick={{ fill: "var(--ink-subtle)", fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                labelFormatter={(t) => time.format(Number(t))}
                formatter={(v) => [`${v} ${s.unit}`, s.label]}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)" }}
              />
              <Area type={metric === "flow_rate" ? "stepAfter" : "monotone"} dataKey="v" stroke="#1d7a7a" strokeWidth={2} fill="url(#fill)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
