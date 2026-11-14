"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useShell } from "@/components/shell/shell-context";
import type { RoutineCheck } from "@/lib/data/types";
import type { Task } from "@/lib/tasks";

const pill = "inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-muted";

function Tile({ title, text, children }: { title: string; text: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-serif text-[21px] leading-tight text-ink">{title}</h3>
      <p className="mb-4 mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

/** One place to see what needs doing today, instead of checking every screen. */
export function ActionCenter({ tasks, checks, canCheck, timezone, onRefresh }: {
  tasks: Task[]; checks: RoutineCheck[]; canCheck: boolean; timezone: string; onRefresh: () => Promise<void> | void;
}) {
  const shell = useShell();
  const [busy, setBusy] = useState(false);
  const routineDue = tasks.some((t) => t.id === "routine");
  const last = checks[0];
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });
  const work = tasks.filter((t) => t.id !== "routine");
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-[26px] leading-tight text-ink">Today</h2>
          <p className="mt-0.5 text-sm text-ink-muted">One place to see what needs doing, instead of checking every screen.</p>
        </div>
        <button
          onClick={async () => { setBusy(true); await onRefresh(); setBusy(false); }}
          className={pill}
          aria-label="Refresh data"
        >
          <RefreshCw className={`mr-1.5 size-4 ${busy ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Tile
          title="Tasks for you"
          text={work.length ? <><b className="font-semibold text-ink">{work.length}</b> to do. Next: {work[0].title}.</> : "Nothing needs doing right now."}
        >
          <Link href="/tasks" className={pill}>View tasks</Link>
        </Tile>
        <Tile
          title="Routine check"
          text={
            routineDue
              ? "Not logged yet today. Four quick checks: intake, pipeline, storage and solar panels."
              : last
                ? `Logged by ${last.actor_name ?? "a team member"} at ${time.format(new Date(last.occurred_at))}${last.issues ? `, ${last.issues} item${last.issues > 1 ? "s" : ""} to follow up` : ", all OK"}.`
                : "Operators and technicians log a daily walk-round of the system."
          }
        >
          {canCheck ? (
            <button onClick={shell.openRoutine} className={pill}>Log check</button>
          ) : (
            <Link href="/site" className={pill}>View site</Link>
          )}
        </Tile>
        <Tile title="Messages" text="SMS alerts and replies. Anyone on the team can acknowledge by replying 1, even without internet.">
          <button onClick={shell.openMessages} className={pill}>Open messages</button>
        </Tile>
      </div>
    </section>
  );
}
