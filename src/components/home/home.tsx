"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TaskRow } from "@/components/tasks/task-row";
import { useSession } from "@/lib/auth/session";
import { useSiteData } from "@/lib/data/site-data";
import { deriveTasks } from "@/lib/tasks";
import { useNow } from "@/lib/use-now";
import { ActiveAlerts } from "./active-alerts";
import { Greeting } from "./greeting";
import { KeyTiles } from "./key-tiles";
import { NextStep } from "./next-step";
import { QuickActions } from "./quick-actions";

/**
 * Operator Home answers, in this order: Is water flowing? Is something wrong? Who is responsible?
 * What should I do next? Exactly one orange action: the incident's next step, otherwise today's routine check.
 */
export function Home() {
  const session = useSession();
  const now = useNow();
  const { data, error } = useSiteData();
  if (session.status !== "signed_in") return null;
  const membership = session.memberships[0];

  if (!membership) {
    return (
      <Card className="p-6">
        <h1 className="type-h1">Welcome</h1>
        <p className="mt-2 text-ink-muted">Your account is not linked to a water system yet. Ask an administrator to add you.</p>
      </Card>
    );
  }
  if (error && !data) return <Card className="p-6 font-medium text-crit" role="alert">{error}</Card>;
  if (!data) {
    return (
      <div className="space-y-5" aria-label="Loading">
        <div className="h-24 w-2/3 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-muted" />)}</div>
      </div>
    );
  }

  const role = membership.role;
  const tasks = deriveTasks({
    role, userId: session.user.id, timezone: data.site.timezone, status: data.site.status,
    active: data.active, members: data.members, checks: data.checks, now,
  });
  const top = [...data.active].sort((a, b) =>
    a.severity === b.severity ? b.detected_at.localeCompare(a.detected_at) : a.severity === "needs_attention" ? -1 : 1,
  )[0];
  const canCheck = role === "operator" || role === "technician" || role === "admin";

  return (
    <div className="space-y-6">
      <Greeting name={session.profile?.fullName ?? ""} site={data.site} now={now} />
      {top && <NextStep incident={top} more={data.active.length - 1} members={data.members} role={role} userId={session.user.id} />}
      <KeyTiles latest={data.latest} timezone={data.site.timezone} now={now} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ActiveAlerts active={data.active} members={data.members} timezone={data.site.timezone} />
        <section className="rounded-2xl border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-base font-semibold">Today</h2>
            <Link href="/tasks" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
              All tasks <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <p className="flex items-center gap-2 px-5 pb-5 pt-2 text-sm text-ink-muted">
              <CircleCheck className="size-4 text-ok" aria-hidden />
              Nothing needs doing right now.
            </p>
          ) : (
            <div className="px-2 pb-2 pt-1">
              {tasks.slice(0, 3).map((t) => (
                <TaskRow key={t.id} task={t} primary={!top && t.id === "routine"} />
              ))}
            </div>
          )}
        </section>
      </div>
      <QuickActions canCheck={canCheck} />
    </div>
  );
}
