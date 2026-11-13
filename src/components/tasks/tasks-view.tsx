"use client";

import { CircleCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROLE_LABEL, useSession } from "@/lib/auth/session";
import { useSiteData } from "@/lib/data/site-data";
import { formatSiteTime } from "@/lib/format";
import { deriveTasks } from "@/lib/tasks";
import { useNow } from "@/lib/use-now";
import { TaskRow } from "./task-row";

/** Today's work for this person, derived live from the incident record: always current, never duplicated. */
export function TasksView() {
  const session = useSession();
  const now = useNow();
  const { data } = useSiteData();
  if (session.status !== "signed_in") return null;
  const membership = session.memberships[0];
  if (!membership || !data) return <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" aria-label="Loading" />;

  const tasks = deriveTasks({
    role: membership.role, userId: session.user.id, timezone: data.site.timezone, status: data.site.status,
    active: data.active, members: data.members, checks: data.checks, now,
  });
  const lastCheck = data.checks[0];
  const hasIncidentTask = tasks.some((t) => "href" in t.target);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Eyebrow>{ROLE_LABEL[membership.role]}</Eyebrow>
        <h1 className="type-h1 mt-2">Today&apos;s tasks</h1>
        <p className="mt-2 text-sm text-ink-muted">Most urgent first. Each task opens exactly where it is done.</p>
      </header>
      <section className="rounded-2xl border border-line bg-surface p-2 shadow-card">
        {tasks.length === 0 ? (
          <p className="flex items-center gap-2 p-4 text-sm text-ink-muted">
            <CircleCheck className="size-4 text-ok" aria-hidden />
            You&apos;re all caught up. Nothing needs doing right now.
          </p>
        ) : (
          tasks.map((t) => <TaskRow key={t.id} task={t} primary={!hasIncidentTask && t.id === "routine"} />)
        )}
      </section>
      {lastCheck && (
        <p className="text-sm text-ink-muted">
          Last routine check: {formatSiteTime(lastCheck.occurred_at, data.site.timezone)}
          {lastCheck.actor_name ? ` by ${lastCheck.actor_name}` : ""}
          {lastCheck.issues ? ` · ${lastCheck.issues} item${lastCheck.issues > 1 ? "s" : ""} not OK` : " · all OK"}
        </p>
      )}
    </div>
  );
}
