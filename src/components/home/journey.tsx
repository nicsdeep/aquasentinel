import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { IncidentSummary, RecentEvent } from "@/lib/data/types";
import { STATUS_LABEL } from "@/lib/incidents";
import { cn } from "@/lib/cn";

const STEPS = [
  { label: "Detected", hint: "Rule or person reports" },
  { label: "Alerted", hint: "Dashboard and SMS" },
  { label: "Acknowledged", hint: "Web or SMS reply 1" },
  { label: "Technician assigned", hint: "Local technician" },
  { label: "Repaired", hint: "Findings recorded" },
  { label: "Verified and closed", hint: "Readings and a reason" },
];

/** How many steps are complete for an incident in this status (the next one is "current"). */
function stepsDone(i: IncidentSummary): number {
  switch (i.status) {
    case "open": return 2;
    case "acknowledged": return 3;
    case "assigned": return i.diagnosis ? 5 : 4;
    case "recovered": return 5;
    case "closed": return 6;
  }
}

/**
 * One incident, every step, the same on every channel. Shows the most urgent open incident; when none is open, the
 * last closed one. Detection and alerts are automatic; people confirm repairs and close incidents.
 */
export function Journey({ active, recent }: { active: IncidentSummary[]; recent: RecentEvent[] }) {
  const top = [...active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  )[0];
  const lastClosed = !top ? recent.find((e) => e.action === "closed") : undefined;
  const done = top ? stepsDone(top) : lastClosed ? 6 : 0;
  const href = top ? `/incidents/${top.id}` : lastClosed ? `/incidents/${lastClosed.incident_id}` : null;
  const caption = top
    ? `${top.reference} · ${top.title} · ${STATUS_LABEL[top.status]}`
    : lastClosed
      ? `Last incident ${lastClosed.reference} · ${lastClosed.title} · closed`
      : "No incidents yet";

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-[26px] leading-tight text-ink">Incident journey</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Detection and alerts are automatic. People confirm repairs and close incidents.</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", top ? "bg-warn-soft text-warn" : "bg-surface-muted text-ink-muted")}>
          {top ? "In progress" : "All clear"}
        </span>
      </div>
      <ol className="mt-6 grid grid-cols-3 gap-y-5 md:grid-cols-6">
        {STEPS.map((s, i) => {
          const state = i < done ? "done" : i === done && top ? "current" : "todo";
          return (
            <li key={s.label} className="relative px-1 text-center">
              {i < STEPS.length - 1 && <span className="absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-[1.05rem] hidden h-px bg-line md:block" aria-hidden />}
              <span
                className={cn(
                  "relative mx-auto grid size-9 place-items-center rounded-full text-sm font-bold",
                  state === "done" ? "bg-ok text-white" : state === "current" ? "bg-warn text-white" : "bg-surface-muted text-ink-subtle",
                )}
                aria-hidden
              >
                {state === "done" ? <Check className="size-4" strokeWidth={3} /> : s.label[0]}
              </span>
              <b className="mt-2 block text-[13px] font-semibold text-ink">{s.label}</b>
              <small className="block text-[11px] leading-snug text-ink-muted">{s.hint}</small>
              <span className="sr-only">{state === "done" ? "done" : state === "current" ? "current step" : "not yet"}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm">
        <span className="text-ink-muted">{caption}</span>
        {href && (
          <Link href={href} className="inline-flex min-h-10 items-center gap-1 font-medium text-accent hover:underline">
            Open incident <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}
