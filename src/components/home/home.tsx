"use client";

import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth/session";
import { useSiteData } from "@/lib/data/site-data";
import { deriveTasks } from "@/lib/tasks";
import { useNow } from "@/lib/use-now";
import { Power, Waves } from "lucide-react";
import type { Evidence } from "@/lib/data/types";
import { ActiveAlerts, incidentIcon } from "./active-alerts";
import { FlowChart } from "./flow-chart";
import { Greeting } from "./greeting";
import { KeyTiles } from "./key-tiles";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { Today } from "./today";

/**
 * Home answers, in this order: Is water flowing? Is something wrong, and who is on it? What should I do today?
 * Then quick actions, the day's water flow and what happened recently. Layout follows the owner's approved
 * reference design (14 Nov 2026). Every row and button opens a working screen or dialog.
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
  const canCheck = role === "operator" || role === "technician" || role === "admin";
  const flowProblem = data.active.some((i) => {
    const icon = incidentIcon(i.evidence as Evidence & { metric?: string });
    return icon === Power || icon === Waves;
  });

  return (
    <div className="relative space-y-5 md:space-y-6">
      <Greeting name={session.profile?.fullName ?? ""} site={data.site} now={now} />
      <KeyTiles latest={data.latest} timezone={data.site.timezone} now={now} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <ActiveAlerts active={data.active} members={data.members} />
        <Today tasks={tasks} />
      </div>
      <QuickActions canCheck={canCheck} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <FlowChart history={data.history} timezone={data.site.timezone} alarm={flowProblem} />
        <RecentActivity events={data.recent} timezone={data.site.timezone} />
      </div>
    </div>
  );
}
