import type { IncidentSummary, Member, RoutineCheck } from "@/lib/data/types";
import type { Role } from "@/lib/auth/session";
import type { SiteStatus, Tone } from "@/lib/status";

export interface Task {
  id: string;
  title: string;
  detail: string;
  tone: Tone;
  /** Where the task is done. "routine" opens the routine-check dialog. */
  target: { href: string } | { action: "routine" };
}

export interface TaskInput {
  role: Role;
  userId: string;
  timezone: string;
  status: SiteStatus;
  active: IncidentSummary[];
  members: Member[];
  checks: RoutineCheck[];
  now: number;
}

const FOLLOW_UP_MS = 2 * 3600 * 1000;

function sameLocalDay(a: number, b: number, timeZone: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  return f.format(a) === f.format(b);
}

/**
 * Today's work for this person, derived from the live incident record (nothing is stored twice).
 * Ordered by urgency: water at risk first, then follow-ups, then routine work.
 */
export function deriveTasks(input: TaskInput): Task[] {
  const { role, userId, active, members, checks, now, timezone, status } = input;
  const name = (id: string | null) => members.find((m) => m.user_id === id)?.full_name ?? "the technician";
  const manager = role === "operator" || role === "committee" || role === "admin";
  const tasks: Task[] = [];
  const href = (i: IncidentSummary) => ({ href: `/incidents/${i.id}` });
  const sorted = [...active].sort((a, b) =>
    a.severity === b.severity ? a.detected_at.localeCompare(b.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  );

  for (const i of sorted) {
    const tone: Tone = i.severity === "needs_attention" ? "crit" : "warn";
    if (role === "technician") {
      if (i.assigned_to === userId && i.status === "assigned") {
        tasks.push(
          i.diagnosis
            ? { id: `verify-${i.id}`, title: `Confirm water is flowing: ${i.title}`, detail: `${i.reference} · findings recorded`, tone: "info", target: href(i) }
            : { id: `inspect-${i.id}`, title: `Inspect and record findings: ${i.title}`, detail: `${i.reference} · ${i.evidence.recommended_action ?? "See the incident"}`, tone, target: href(i) },
        );
      } else if (i.status === "open" || (i.status === "acknowledged" && !i.assigned_to)) {
        tasks.push({ id: `take-${i.id}`, title: `New fault, no technician yet: ${i.title}`, detail: `${i.reference} · take the job if you can`, tone, target: href(i) });
      }
      continue;
    }
    if (i.status === "open" && (manager || role === "admin")) {
      tasks.push({ id: `ack-${i.id}`, title: `Acknowledge: ${i.title}`, detail: `${i.reference} · let the team know someone is on it`, tone, target: href(i) });
    } else if (i.status === "acknowledged" && manager) {
      tasks.push({ id: `assign-${i.id}`, title: `Assign a technician: ${i.title}`, detail: `${i.reference} · acknowledged, nobody assigned`, tone, target: href(i) });
    } else if (i.status === "assigned" && manager && i.assigned_at && now - Date.parse(i.assigned_at) > FOLLOW_UP_MS) {
      tasks.push({ id: `follow-${i.id}`, title: `Follow up with ${name(i.assigned_to)}: ${i.title}`, detail: `${i.reference} · assigned over 2 hours ago`, tone: "info", target: href(i) });
    } else if (i.status === "recovered" && manager) {
      tasks.push({ id: `close-${i.id}`, title: `Close: ${i.title}`, detail: `${i.reference} · water is flowing again`, tone: "ok", target: href(i) });
    }
  }

  if (status === "offline") {
    tasks.push({ id: "offline", title: "Check the monitoring unit's power and signal", detail: "No recent readings from the site", tone: "off", target: { href: "/site" } });
  }

  const doesRoutine = role === "operator" || role === "technician" || role === "admin";
  if (doesRoutine && !checks.some((c) => sameLocalDay(Date.parse(c.occurred_at), now, timezone))) {
    tasks.push({ id: "routine", title: "Do today's routine check", detail: "Intake, pipeline, storage and solar panels · 4 quick checks", tone: "info", target: { action: "routine" } });
  }
  return tasks;
}
