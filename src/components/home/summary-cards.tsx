import Link from "next/link";
import { ArrowRight, CircleCheck, Power, TriangleAlert } from "lucide-react";
import type { IncidentSummary, LatestReading, Member, Metric } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/incidents";
import { describeReading, localHour } from "@/lib/readings";
import { cn } from "@/lib/cn";

const STALE_SECONDS = 15 * 60;

function Chip({ value, label, muted = false }: { value: React.ReactNode; label: string; muted?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-line/70 bg-surface-soft px-3 py-3", muted && "opacity-60")}>
      <b className="tabular block font-serif text-[26px] font-normal leading-none text-ink">{value}</b>
      <span className="mt-1.5 block text-xs text-ink-muted">{label}</span>
    </div>
  );
}

function CardShell({ icon, iconTint, title, badge, text, children, action }: {
  icon: React.ReactNode; iconTint: string; title: string; badge: React.ReactNode; text: React.ReactNode; children: React.ReactNode; action: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-start gap-4">
        <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl", iconTint)}>{icon}</span>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 font-serif text-[30px] leading-tight text-ink">
            {title}
            {badge}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{text}</p>
        </div>
      </div>
      <div className="my-5 grid grid-cols-3 gap-2">{children}</div>
      <div className="mt-auto">{action}</div>
    </section>
  );
}

const btn = "flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition";

/** Open alerts at a glance: how many, where each one is in its journey, and the most urgent one in words. */
export function AlertsCard({ active, members }: { active: IncidentSummary[]; members: Member[] }) {
  const top = [...active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  )[0];
  const owner = top ? members.find((m) => m.user_id === top.assigned_to)?.full_name ?? "unassigned" : "";
  const count = (s: IncidentSummary["status"][]) => active.filter((i) => s.includes(i.status)).length;
  return (
    <CardShell
      icon={active.length ? <TriangleAlert className="size-6" aria-hidden /> : <CircleCheck className="size-6" aria-hidden />}
      iconTint={active.length ? (top?.severity === "needs_attention" ? "bg-crit-soft text-crit" : "bg-warn-soft text-warn") : "bg-ok-soft text-ok"}
      title="Open alerts"
      badge={<span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-sans text-sm font-semibold text-ink-muted">{active.length}</span>}
      text={top ? <>Most urgent: <b className="font-semibold text-ink">{top.title}</b> ({top.reference}) · {STATUS_LABEL[top.status]} · {owner}.</> : "No open alerts. Water is flowing as expected."}
      action={
        <Link href="/incidents" className={cn(btn, active.length ? "bg-as-orange text-white shadow-sm hover:brightness-95" : "border border-line bg-surface text-ink hover:bg-surface-muted")}>
          View open alerts <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    >
      <Chip value={count(["open"])} label="New, not acknowledged" />
      <Chip value={count(["acknowledged", "assigned"])} label="Being repaired" />
      <Chip value={count(["recovered"])} label="Water back, to close" />
    </CardShell>
  );
}

/** The water system at a glance: pump state, and the three readings that matter most, each with its age. */
export function SystemCard({ latest, timezone, now }: { latest: LatestReading[]; timezone: string; now: number }) {
  const hour = localHour(timezone, new Date(now));
  const view = (m: Metric) => {
    const r = latest.find((x) => x.metric === m);
    if (!r) return null;
    const age = secondsSince(r.measured_at, now);
    return { v: describeReading(r, latest, hour), age, stale: age == null || age > STALE_SECONDS };
  };
  const pump = view("pump_running");
  const flow = view("flow_rate");
  const tank = view("tank_level");
  const solar = view("solar_power");
  const battery = latest.find((x) => x.metric === "battery_voltage");
  const running = pump?.v.value === "Running";
  const chip = (x: ReturnType<typeof view>, label: string) =>
    x ? (
      <Chip
        muted={x.stale}
        value={<>{x.v.value}<span className="ml-1 font-sans text-sm text-ink-muted">{x.v.unit}</span></>}
        label={x.stale ? `${label} · may be out of date` : label}
      />
    ) : (
      <Chip value="–" label={`${label} · no reading`} />
    );
  return (
    <CardShell
      icon={<Power className="size-6" aria-hidden />}
      iconTint={running ? "bg-ok-soft text-ok" : "bg-surface-muted text-ink-muted"}
      title="Water system"
      badge={
        <span className={cn("rounded-full px-2.5 py-0.5 font-sans text-sm font-semibold", running ? "bg-ok-soft text-ok" : "bg-surface-muted text-ink-muted")}>
          {pump ? `Pump ${running ? "running" : "stopped"}` : "No pump reading"}
        </span>
      }
      text={<>Readings arrive every 5 minutes from the monitoring unit. Last reading {formatAge(flow?.age ?? null)}{battery ? ` · battery ${battery.value.toFixed(1)} V` : ""}.</>}
      action={
        <Link href="/site" className={cn(btn, "border border-line bg-surface text-ink hover:bg-surface-muted")}>
          View site details <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    >
      {chip(flow, "Water flow")}
      {chip(tank, "Storage level")}
      {chip(solar, "Solar power")}
    </CardShell>
  );
}
