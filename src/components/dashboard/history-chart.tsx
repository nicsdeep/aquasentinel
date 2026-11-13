"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";
import type { HistoryPoint } from "@/lib/data/types";

interface Point {
  t: number;
  tank?: number;
  flow?: number;
}

function toSeries(history: HistoryPoint[]): Point[] {
  const byTime = new Map<number, Point>();
  for (const h of history) {
    const t = Date.parse(h.measured_at);
    const p = byTime.get(t) ?? { t };
    if (h.metric === "tank_level") p.tank = h.value;
    if (h.metric === "flow_rate") p.flow = h.value;
    byTime.set(t, p);
  }
  return [...byTime.values()].sort((a, b) => a.t - b.t);
}

/**
 * Storage level and water flow over 24 hours, explained in plain words for someone unfamiliar with
 * the engineering (PROJECT_RULES §6).
 */
export function HistoryChart({ history, timezone }: { history: HistoryPoint[]; timezone: string }) {
  const data = toSeries(history);
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <Card>
      <CardHeader
        title="Last 24 hours"
        description="Teal area: how full storage is (%). Dark line: water flowing in (m³/h). Storage should rise while the solar pump runs by day and fall slowly at night."
      />
      <div className="h-64 px-2 pb-4 pt-2 md:h-72" role="img" aria-label="Chart of storage level and water flow over the last 24 hours">
        {data.length < 2 ? (
          <p className="grid h-full place-items-center text-sm text-ink-muted">Not enough readings yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="tankFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#59c3c3" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#59c3c3" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={(t: number) => time.format(t)}
                tick={{ fill: "var(--ink-subtle)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis yAxisId="tank" domain={[0, 100]} unit="%" tick={{ fill: "var(--ink-subtle)", fontSize: 12 }} tickLine={false} axisLine={false} width={52} />
              <YAxis yAxisId="flow" orientation="right" domain={[0, 16]} hide />
              <Tooltip
                labelFormatter={(t) => time.format(Number(t))}
                formatter={(value, name) => (name === "tank" ? [`${value} %`, "Storage"] : [`${value} m³/h`, "Flow"])}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)" }}
              />
              <Area yAxisId="tank" type="monotone" dataKey="tank" stroke="#59c3c3" strokeWidth={2} fill="url(#tankFill)" connectNulls isAnimationActive={false} />
              <Line yAxisId="flow" type="stepAfter" dataKey="flow" stroke="var(--ink)" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
