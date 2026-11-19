"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, ChevronLeft, ChevronRight, Droplets, Gauge, MonitorSmartphone, Play, Power, RotateCcw, Sun, Waves, Wrench, X } from "lucide-react";
import type { SimAction, Speed } from "@/lib/sim/actions";
import { blocker, tankPct } from "@/lib/sim/engine";
import { cn } from "@/lib/cn";
import { PHOTO_NOTE, PhotoDiagram } from "./photo-diagram";
import { useSim } from "./sim-provider";

/*
 * Building blocks of the water-flow simulation. Each block reads the one shared simulation (useSim) and sends
 * changes as actions, so the same blocks can be placed on different pages and screens and stay in step.
 */

const nf = (n: number, d = 0) => n.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });

function simClock(t: number) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${btn} bg-as-orange text-white shadow-sm hover:brightness-95`;
const secondary = `${btn} border border-line bg-surface text-ink hover:bg-surface-muted`;
const danger = `${btn} border border-crit/30 bg-crit-soft text-crit hover:brightness-95`;
const card = "rounded-3xl border border-line bg-surface shadow-card";

function Stat({ label, value, sub, tone = "ink", testId }: { label: string; value: string; sub?: string; tone?: "ink" | "ok" | "warn" | "crit"; testId?: string }) {
  const color = { ink: "text-ink", ok: "text-ok", warn: "text-warn", crit: "text-crit" }[tone];
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums leading-tight", color)} data-testid={testId}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border border-line bg-surface-muted p-1" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={String(v)} role="radio" aria-checked={value === v} onClick={() => onChange(v)}
          className={cn("min-h-10 rounded-full px-3 text-sm font-medium", value === v ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink")}>
          {text}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------- */
/* Shared header pieces                                                                                         */
/* ---------------------------------------------------------------------------------------------------------- */

const PAGES = [
  { href: "/demo/water-flow", label: "Whole system" },
  { href: "/demo/technician", label: "Technician" },
  { href: "/demo/community", label: "Community" },
];

/** Links between the three demo pages, and how many screens are connected to the shared simulation. */
export function DemoBar() {
  const { status, screens } = useSim();
  const path = usePathname();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Simulation pages" className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
        {PAGES.map((p) => (
          <Link key={p.href} href={p.href} aria-current={path === p.href ? "page" : undefined}
            className={cn("min-h-10 rounded-full px-4 py-2 text-sm font-medium", path === p.href ? "bg-info-soft text-ink" : "text-ink-muted hover:text-ink")}>
            {p.label}
          </Link>
        ))}
      </nav>
      <p className="inline-flex items-center gap-2 text-sm text-ink-muted" data-testid="sync-status">
        <MonitorSmartphone className="size-4" aria-hidden />
        {status === "live" ? `Live on ${screens} screen${screens === 1 ? "" : "s"}` : status === "connecting" ? "Connecting screens…" : "This screen only"}
        <span className={cn("size-2 rounded-full", status === "live" ? "bg-ok" : status === "connecting" ? "bg-warn" : "bg-off")} aria-hidden />
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------- */
/* Guided demonstration                                                                                         */
/* ---------------------------------------------------------------------------------------------------------- */

interface GuideStep {
  title: string;
  text: string;
  actions?: SimAction[];
}

const GUIDE: GuideStep[] = [
  { title: "The source", text: "The River Athi is the water source. The intake draws water from the river.", actions: [{ kind: "reset" }, { kind: "setSpeed", speed: 60 }] },
  { title: "Start the pump", text: "The operator turns the pump on. The impeller turns and water starts moving.", actions: [{ kind: "setPump", on: true }] },
  { title: "Water in the pipes", text: "Water travels inside the pipes, through the pump, the smart meter and the pipeline, towards the tank." },
  { title: "The smart meter", text: "The meter shows the flow (200 L/min) and adds every litre that passes it to the total." },
  { title: "The tank fills", text: "Water enters the storage tank. The level rises in proportion to the litres delivered." },
  { title: "People use water", text: "Community water use is switched on: water leaves the tank, so the level falls.", actions: [{ kind: "setPump", on: false }, { kind: "setConsumption", on: true }] },
  { title: "Automatic mode", text: "AquaSentinel now watches the tank level. Below the low threshold it sends a start request to the local pump controller.", actions: [{ kind: "setMode", mode: "auto" }, { kind: "setAutoConfirm", on: true }] },
  { title: "The level falls", text: "Water use continues. Watch the level fall towards the low threshold (25 %).", actions: [{ kind: "setTankPct", pct: 30 }, { kind: "setConsumption", on: true }, { kind: "setSpeed", speed: 300 }] },
  { title: "Automatic refill", text: "Low level detected: AquaSentinel requests a start, the controller starts the pump and the tank refills until it reaches 95 %, then the pump stops." },
  { title: "A fault", text: "A pipe starts leaking: the meter still counts all the water, but less reaches the tank, so AquaSentinel flags a possible leak for inspection.", actions: [{ kind: "startLeak" }] },
];

export function GuideBar() {
  const { dispatch } = useSim();
  const [guide, setGuide] = useState<number | null>(null);
  function goTo(i: number) {
    setGuide(i);
    GUIDE[i].actions?.forEach(dispatch);
  }
  if (guide === null) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
        <p className="text-sm text-ink-muted">Present it step by step, or use the controls freely.</p>
        <button className={secondary} onClick={() => goTo(0)}><Play className="size-4" aria-hidden /> Start guided demo</button>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-accent/30 bg-info-soft px-4 py-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Step {guide + 1} of {GUIDE.length}</p>
          <p className="mt-1 text-lg font-semibold text-ink" data-testid="guide-title">{GUIDE[guide].title}</p>
          <p className="mt-1 text-[15px] text-ink-muted">{GUIDE[guide].text}</p>
        </div>
        <button onClick={() => setGuide(null)} className="grid size-10 place-items-center rounded-full text-ink-muted hover:bg-surface" aria-label="Exit guided demo"><X className="size-5" aria-hidden /></button>
      </div>
      <div className="mt-3 flex gap-2">
        <button className={secondary} disabled={guide === 0} onClick={() => goTo(guide - 1)}><ChevronLeft className="size-4" aria-hidden /> Back</button>
        {guide < GUIDE.length - 1
          ? <button className={secondary} onClick={() => goTo(guide + 1)}>Next <ChevronRight className="size-4" aria-hidden /></button>
          : <button className={secondary} onClick={() => setGuide(null)}>Finish</button>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------- */
/* Diagram, controls, stats, alerts                                                                             */
/* ---------------------------------------------------------------------------------------------------------- */

export function SimDiagramCard() {
  const { state } = useSim();
  return (
    <div className={cn(card, "min-w-0 p-3 md:p-5")}>
      {/* Phones: keep the diagram readable and let it scroll sideways instead of shrinking it */}
      <div className="overflow-x-auto">
        <div className="min-w-[680px] md:min-w-0">
          <PhotoDiagram s={state} />
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-ink-subtle md:hidden">Swipe sideways to see the whole system.</p>
      <p className="mt-2 text-xs text-ink-subtle">{PHOTO_NOTE}</p>
    </div>
  );
}

export function SimControls({ wide = false }: { wide?: boolean }) {
  const { state: s, speed, dispatch } = useSim();
  const anyFault = s.pumpFault || !s.solarOk || s.leak || s.sourcePct < s.config.minSourcePct;
  const riverLow = s.sourcePct < s.config.minSourcePct;

  // The single orange action for the current situation.
  const primaryAction = anyFault
    ? { label: "Restore normal operation", action: { kind: "restoreNormal" } as SimAction, icon: Wrench }
    : s.startRequested
      ? { label: "Confirm start", action: { kind: "confirmStart" } as SimAction, icon: Play }
      : s.mode === "manual" && !s.pumpCommand
        ? { label: "Turn pump ON", action: { kind: "setPump", on: true } as SimAction, icon: Power }
        : null;

  return (
    <div className={cn(card, "grid min-w-0 content-start gap-4 p-4 md:grid-cols-3 md:p-5", !wide && "lg:grid-cols-1")}>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Pump</h2>
        {primaryAction && (
          <button className={cn(primary, "w-full")} onClick={() => dispatch(primaryAction.action)}><primaryAction.icon className="size-4" aria-hidden /> {primaryAction.label}</button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className={secondary} disabled={s.mode !== "manual" || s.pumpCommand} onClick={() => dispatch({ kind: "setPump", on: true })}>Pump ON</button>
          <button className={secondary} disabled={s.mode !== "manual" || !s.pumpCommand} onClick={() => dispatch({ kind: "setPump", on: false })}>Pump OFF</button>
        </div>
        <Segmented label="Operating mode" value={s.mode} options={[["manual", "Manual"], ["auto", "Automatic"]]} onChange={(m) => dispatch({ kind: "setMode", mode: m })} />
        {s.mode === "auto" && (
          <div className="space-y-2 rounded-2xl bg-surface-muted p-3 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span>Request start below</span>
              <span className="flex items-center gap-2">
                <input type="range" min={5} max={80} value={s.lowPct} onChange={(e) => dispatch({ kind: "setThresholds", low: Number(e.target.value), high: s.highPct })} aria-label="Low threshold" />
                <b className="w-10 tabular-nums">{s.lowPct}%</b>
              </span>
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Stop at</span>
              <span className="flex items-center gap-2">
                <input type="range" min={20} max={100} value={s.highPct} onChange={(e) => dispatch({ kind: "setThresholds", low: s.lowPct, high: Number(e.target.value) })} aria-label="High threshold" />
                <b className="w-10 tabular-nums">{s.highPct}%</b>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={s.autoConfirm} onChange={(e) => dispatch({ kind: "setAutoConfirm", on: e.target.checked })} />
              Controller starts the pump without waiting for the operator
            </label>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Water use and speed</h2>
        <button className={cn(secondary, "w-full")} onClick={() => dispatch({ kind: "setConsumption", on: !s.consumption })} aria-pressed={s.consumption}>
          <Droplets className="size-4" aria-hidden /> {s.consumption ? "Stop water use" : "Start water use (100 L/min)"}
        </button>
        <Segmented<Speed> label="Simulation speed" value={speed} options={[[1, "×1"], [60, "×60"], [300, "×300"]]} onChange={(v) => dispatch({ kind: "setSpeed", speed: v })} />
        <button className={cn(secondary, "w-full")} onClick={() => dispatch({ kind: "reset" })}><RotateCcw className="size-4" aria-hidden /> Reset simulation</button>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink">Fault scenarios</h2>
        <div className="grid grid-cols-2 gap-2">
          <button className={s.solarOk ? secondary : danger} onClick={() => dispatch({ kind: s.solarOk ? "failSolar" : "restoreSolar" })} aria-pressed={!s.solarOk}>
            <Sun className="size-4" aria-hidden /> {s.solarOk ? "Solar failure" : "Restore solar"}
          </button>
          <button className={s.leak ? danger : secondary} onClick={() => dispatch({ kind: s.leak ? "repairLeak" : "startLeak" })} aria-pressed={s.leak}>
            <Waves className="size-4" aria-hidden /> {s.leak ? "Repair leak" : "Pipeline leak"}
          </button>
          <button className={s.pumpFault ? danger : secondary} onClick={() => dispatch({ kind: s.pumpFault ? "clearFault" : "pumpFault" })} aria-pressed={s.pumpFault}>
            <Gauge className="size-4" aria-hidden /> {s.pumpFault ? "Clear pump fault" : "Pump fault"}
          </button>
          <button className={riverLow ? danger : secondary} onClick={() => dispatch({ kind: "setSourceLow", low: !riverLow })} aria-pressed={riverLow}>
            <Droplets className="size-4" aria-hidden /> {riverLow ? "Restore river" : "Low river"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function SimStats({ compact = false }: { compact?: boolean }) {
  const { state: s, speed } = useSim();
  const level = tankPct(s);
  const why = blocker(s);
  const pumpLabel = s.pumpFault ? "Fault" : s.pumpRunning ? "Running" : "Stopped";
  const pumpTone = s.pumpFault ? "crit" : s.pumpRunning ? "ok" : "ink";
  return (
    <div className="space-y-2">
      <div className={cn("grid grid-cols-2 gap-3", compact ? "" : "md:grid-cols-4")}>
        <Stat label="Pump" value={pumpLabel} tone={pumpTone} sub={why && s.pumpCommand ? { fault: "Pump fault", power: "No solar power", source: "River too low" }[why] : s.mode === "auto" ? "Automatic mode" : "Manual mode"} testId="stat-pump" />
        <Stat label="Flow" value={`${nf(s.flowLpm)} L/min`} sub={s.leak && s.flowLpm > 0 ? `${nf(s.inflowLpm)} L/min reaches the tank` : "At the smart meter"} testId="stat-flow" />
        <Stat label="Meter total" value={`${nf(s.meterL)} L`} sub={`${nf(s.meterL / 1000, 2)} m³`} testId="stat-meter" />
        <Stat label="Tank" value={`${nf(level, 1)} %`} sub={`${nf(s.tankL)} of ${nf(s.config.capacityL)} L`} tone={level <= s.lowPct ? "warn" : "ink"} testId="stat-tank" />
        {!compact && (
          <>
            <Stat label="Delivered to tank" value={`${nf(s.deliveredL)} L`} sub={s.consumption ? `Water use ${nf(s.outflowLpm)} L/min` : "Water use off"} />
            <Stat label="Pipeline" value={s.leak ? "Possible leak" : "Normal"} tone={s.leak ? "warn" : "ok"} sub={s.leak ? `${nf(s.leakLostL)} L not reaching tank` : "No losses detected"} testId="stat-pipeline" />
            <Stat label="Solar power" value={s.solarOk ? "Available" : "Failed"} tone={s.solarOk ? "ok" : "crit"} />
            <Stat label="River source" value={`${nf(s.sourcePct)} %`} tone={s.sourcePct < s.config.minSourcePct ? "crit" : "ok"} sub={`Safe minimum ${s.config.minSourcePct} %`} />
          </>
        )}
      </div>
      <p className="text-xs text-ink-subtle">Simulated time {simClock(s.t)} · speed ×{speed}</p>
    </div>
  );
}

export function SimAlerts() {
  const { state: s } = useSim();
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3" aria-live="polite">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">Active alerts</p>
      {s.alerts.length === 0 ? (
        <p className="mt-1 text-sm text-ink-muted">None. The system is operating normally.</p>
      ) : (
        <ul className="mt-2 space-y-2" data-testid="alerts">
          {s.alerts.slice(0, 4).map((a) => (
            <li key={a.id} className="flex gap-2 text-sm text-ink">
              <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", a.kind === "tank_full" ? "text-ok" : "text-warn")} aria-hidden />
              <span>{a.text} <span className="text-ink-subtle">({simClock(a.at)})</span></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The whole system on one screen (diagram, controls, live stats and alerts). */
export function WaterSimulation() {
  return (
    <div className="space-y-5">
      <GuideBar />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <SimDiagramCard />
        <SimControls />
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SimStats />
        <SimAlerts />
      </div>
    </div>
  );
}
