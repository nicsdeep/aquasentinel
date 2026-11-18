"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, Megaphone, OctagonAlert, TriangleAlert, UserRound } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useSession, type Role } from "@/lib/auth/session";
import { useSiteData, type SiteData } from "@/lib/data/site-data";
import type { IncidentSummary, Metric, Outcome } from "@/lib/data/types";
import { formatAge, secondsSince } from "@/lib/format";
import { firstName, greeting, statusPhrase } from "@/lib/greeting";
import { OUTCOME_LABEL, STATUS_LABEL, resultMessage } from "@/lib/incidents";
import { describeReading, localHour } from "@/lib/readings";
import { TONE_CLASSES, type SiteStatus, type Tone } from "@/lib/status";
import { getSupabase } from "@/lib/supabase/client";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";

const WORD: Record<Tone, string> = { ok: "text-as-teal-strong", info: "text-as-teal-strong", warn: "text-warn", crit: "text-crit", off: "text-off" };
const LEAD: Record<SiteStatus, string> = { normal: "Your water is", warning: "Your water", needs_attention: "Your water", offline: "Your water system is" };
const TILES: Metric[] = ["flow_rate", "tank_level", "pump_running", "solar_power"];
const STALE_SECONDS = 15 * 60;
const field = "mt-1 block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base";

/** Most urgent first: needs attention before warning, then newest. */
function mostUrgent(active: IncidentSummary[]): IncidentSummary | undefined {
  return [...active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  )[0];
}

/**
 * Operator Home (owner's choice, Option A "Status first", 18 Nov 2026). Answers in order: is my water OK, what must I
 * do now, and the four readings that matter. Kept current by Realtime through useSiteData; never needs a reload.
 */
export function OperatorHome() {
  const session = useSession();
  const now = useNow();
  const { data, error, reload } = useSiteData();
  if (session.status !== "signed_in") return null;
  const membership = session.memberships[0];

  if (!membership) {
    return (
      <Card className="mx-auto max-w-4xl p-6">
        <h1 className="type-h1">Welcome</h1>
        <p className="mt-2 text-ink-muted">Your account is not linked to a water system yet. Ask an administrator to add you.</p>
      </Card>
    );
  }
  if (error && !data) return <Card className="mx-auto max-w-4xl p-6 font-medium text-crit" role="alert">{error}</Card>;
  if (!data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6" aria-label="Loading">
        <div className="h-28 w-3/4 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-32 animate-pulse rounded-3xl bg-surface-muted" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{TILES.map((m) => <div key={m} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />)}</div>
      </div>
    );
  }

  const p = statusPhrase(data.site.status);
  const name = firstName(session.profile?.fullName ?? "");
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-[clamp(38px,5vw,64px)] leading-[1.02] tracking-[-0.02em] text-ink">
          {greeting(data.site.timezone, new Date(now))}
          {name ? `, ${name}.` : "."} <span className="block sm:inline">{LEAD[data.site.status]} </span>
          <em className={cn("italic", WORD[p.tone])}>{p.text.replace(/\.$/, "").toLowerCase()}.</em>
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted">
          {data.site.name} · Updated {formatAge(secondsSince(data.site.last_reading_at, now))}
        </p>
      </div>
      <NextAction data={data} incident={mostUrgent(data.active)} role={membership.role} userId={session.user.id} now={now} onDone={reload} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TILES.map((m) => <Tile key={m} data={data} now={now} metric={m} />)}
      </div>
    </div>
  );
}

function Tile({ data, now, metric }: { data: SiteData; now: number; metric: Metric }) {
  const r = data.latest.find((x) => x.metric === metric);
  if (!r) return null;
  const v = describeReading(r, data.latest, localHour(data.site.timezone, new Date(now)));
  const age = secondsSince(r.measured_at, now);
  const stale = age == null || age > STALE_SECONDS;
  const Icon = v.icon;
  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-4 shadow-card", stale && "opacity-60")}>
      <div className="flex items-center gap-2.5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", TONE_CLASSES[v.tone])}><Icon className="size-[18px]" aria-hidden /></span>
        <span className="text-sm font-medium text-ink-muted">{v.label}</span>
      </div>
      <p className="mt-3 text-xl font-semibold tabular-nums text-ink">
        {v.value}<span className="ml-1 text-sm font-normal text-ink-muted">{v.unit}</span>
      </p>
      <p className="mt-1 text-xs text-ink-subtle">{stale ? "May be out of date" : `${v.state} · ${formatAge(age)}`}</p>
    </div>
  );
}

/** The one thing to do now, with the one orange button that does it. Every button calls a real database function. */
function NextAction({ data, incident, role, userId, now, onDone }: {
  data: SiteData; incident?: IncidentSummary; role: Role; userId: string; now: number; onDone: () => void;
}) {
  const shell = useShell();
  const { notify } = useToast();
  const [modal, setModal] = useState<"assign" | "close" | null>(null);
  const [busy, setBusy] = useState(false);
  const technicians = data.members.filter((m) => m.role === "technician");
  const [technician, setTechnician] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("fault_repaired");
  const [reason, setReason] = useState("");

  if (!incident) {
    return (
      <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center md:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ok-soft text-ok"><CircleCheck className="size-6" aria-hidden /></span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-ink">Nothing needs you right now</h2>
          <p className="text-sm text-ink-muted">No open alerts. If you see a problem at the site, report it.</p>
        </div>
        <Button variant="primary" size="lg" onClick={shell.openReport}>
          <Megaphone className="size-4" aria-hidden /> Report a problem
        </Button>
      </section>
    );
  }

  async function call(fn: string, args: Record<string, unknown>, success: string) {
    setBusy(true);
    const { data: result, error } = await getSupabase()!.rpc(fn, args);
    setBusy(false);
    if (error) return notify("error", "Could not reach the server. Check your connection and try again.");
    if (result !== "ok") return notify("error", resultMessage(String(result)));
    notify("success", success);
    setModal(null);
    onDone();
  }

  const i = incident;
  const manager = role === "operator" || role === "committee" || role === "admin";
  const assignee = data.members.find((m) => m.user_id === i.assigned_to)?.full_name;
  const crit = i.severity === "needs_attention";

  let action: { label: string; run: () => void } | null = null;
  if (i.status === "open" && (manager || role === "technician")) {
    action = { label: "Acknowledge", run: () => call("incident_acknowledge", { p_incident: i.id }, `${i.reference} acknowledged.`) };
  } else if (i.status === "acknowledged" && manager && technicians.length) {
    action = { label: "Assign technician", run: () => { setTechnician(technicians[0].user_id); setModal("assign"); } };
  } else if (i.status === "acknowledged" && role === "technician") {
    action = { label: "Take this job", run: () => call("incident_assign", { p_incident: i.id, p_technician: userId }, "You have taken this job.") };
  } else if (i.status === "recovered" && manager) {
    action = { label: "Close incident", run: () => { setOutcome("fault_repaired"); setReason(""); setModal("close"); } };
  }

  return (
    <section className={cn("rounded-3xl border bg-surface p-5 shadow-card md:p-6", crit ? "border-crit/30" : "border-warn/30")}>
      <div className="flex items-start gap-4">
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", crit ? "bg-crit-soft text-crit" : "bg-warn-soft text-warn")}>
          {crit ? <OctagonAlert className="size-6" aria-hidden /> : <TriangleAlert className="size-6" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{action ? "Do this next" : "In progress"}</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{i.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {i.reference} · {STATUS_LABEL[i.status]} · detected {formatAge(secondsSince(i.detected_at, now))}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink">
            <UserRound className="size-4 text-ink-subtle" aria-hidden />
            {i.status === "assigned" && assignee ? `${assignee} is repairing it` : assignee ?? "Not yet assigned"}
          </p>
        </div>
      </div>
      {action && (
        <Button variant="primary" size="lg" className="mt-5 w-full sm:w-auto" loading={busy} onClick={action.run}>
          {action.label} <ArrowRight className="size-4" aria-hidden />
        </Button>
      )}

      <Dialog open={modal === "assign"} onClose={() => setModal(null)} title="Assign a technician" description="They receive an SMS with the incident details.">
        <label className="block text-sm font-medium">
          Technician
          <select className={field} value={technician} onChange={(e) => setTechnician(e.target.value)}>
            {technicians.map((t) => <option key={t.user_id} value={t.user_id}>{t.full_name}</option>)}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={() => call("incident_assign", { p_incident: i.id, p_technician: technician }, "Technician assigned and notified by SMS.")}>
            Assign
          </Button>
        </div>
      </Dialog>

      <Dialog open={modal === "close"} onClose={() => setModal(null)} title={`Close ${i.reference}`} description="Closing keeps the full record for reports and learning.">
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Outcome
            <select className={field} value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)}>
              {(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Reason
            <textarea required rows={2} className={field} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Intake cleaned, flow back to 12 m³/h" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={() => call("incident_close", { p_incident: i.id, p_outcome: outcome, p_reason: reason }, `${i.reference} closed.`)}>
            Close incident
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
