"use client";

import { BarChart3 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/lib/data/types";
import { localHour } from "@/lib/readings";

/** SVG attributes cannot read CSS variables reliably, so the chart mirrors three tokens: as-teal, accent, crit. */
const AQUA = "#00afce";
const AQUA_INK = "#00738c";
const CRIT = "#c62828";

/**
 * Water flow over the last 24 hours. When there is an open pump or flow problem, the stretch of zero flow at the end
 * is drawn in red, so the gap is visible at a glance. Zero flow at night with nothing wrong stays teal (normal).
 */
export function FlowChart({ history, timezone, alarm }: { history: HistoryPoint[]; timezone: string; alarm: boolean }) {
  const points = history.filter((h) => h.metric === "flow_rate").map((h) => ({ t: Date.parse(h.measured_at), v: h.value }));
  let cut = points.length;
  if (alarm) while (cut > 0 && points[cut - 1].v < 0.5) cut--;
  const data = points.map((p, i) => ({ t: p.t, v: i <= cut ? p.v : null, z: i >= Math.max(cut - 1, 0) && alarm && cut < points.length ? p.v : null }));
  const last = points.at(-1);
  const max = Math.max(2, ...points.map((p) => p.v));
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });
  // Ticks on whole hours that are multiples of three in the site's time zone (06:00, 09:00, …).
  const ticks: number[] = [];
  if (points.length > 1) {
    const hour = 3600_000;
    for (let t = Math.ceil(points[0].t / hour) * hour; t <= points.at(-1)!.t; t += hour) {
      if (localHour(timezone, new Date(t)) % 3 === 0) ticks.push(t);
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        <BarChart3 className="size-6 text-accent" aria-hidden />
        Water flow <span className="font-normal text-ink-muted">(last 24 hours)</span>
      </h2>
      <div className="mt-3 h-48 md:h-52" role="img" aria-label="Water flow over the last 24 hours">
        {points.length < 2 ? (
          <p className="grid h-full place-items-center text-sm text-ink-muted">Not enough readings yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="flowFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AQUA} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={AQUA} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="t" type="number" domain={["dataMin", "dataMax"]} scale="time" ticks={ticks} tickFormatter={(t: number) => time.format(t)}
                tick={{ fill: "var(--ink-muted)", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "var(--line)" }} minTickGap={8} />
              <YAxis domain={[0, Math.ceil(max)]} tick={{ fill: "var(--ink-muted)", fontSize: 12 }} tickLine={false} axisLine={false} width={40}
                label={{ value: "m³/h", angle: -90, position: "insideLeft", fill: "var(--ink-muted)", fontSize: 12, dx: 6 }} />
              <Tooltip labelFormatter={(t) => time.format(Number(t))} formatter={(v) => [`${v} m³/h`, "Flow"]}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink)" }} />
              <Area type="monotone" dataKey="v" stroke={AQUA} strokeWidth={2.5} fill="url(#flowFill)" isAnimationActive={false} connectNulls={false} />
              <Area type="linear" dataKey="z" stroke={CRIT} strokeWidth={2.5} fill="none" isAnimationActive={false} connectNulls={false} />
              {last && <ReferenceDot x={last.t} y={last.v} r={5} fill={alarm && last.v < 0.5 ? CRIT : AQUA_INK} stroke="#fff" strokeWidth={2} />}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
