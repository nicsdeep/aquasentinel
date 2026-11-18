"use client";

import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth/session";
import { useSiteData } from "@/lib/data/site-data";
import { deriveTasks } from "@/lib/tasks";
import { useNow } from "@/lib/use-now";
import { Info } from "lucide-react";
import { ActionCenter } from "./action-center";
import { Hero } from "./hero";
import { Journey } from "./journey";
import { AlertsCard, SystemCard } from "./summary-cards";

/**
 * Home answers, in this order: Is my water system OK? Is anything wrong, and where is it in its journey?
 * What needs doing today? Calm, card-based layout (owner's reference, 14 Nov 2026). At most one orange action:
 * "View open alerts" while alerts are open, otherwise "Report a problem". Every button opens a working screen.
 */
export function Home() {
  const session = useSession();
  const now = useNow();
  const { data, error, reload } = useSiteData();
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

  return (
    <div className="relative space-y-5 md:space-y-6">
      <Hero name={session.profile?.fullName ?? ""} site={data.site} now={now} orange={data.active.length === 0} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AlertsCard active={data.active} members={data.members} />
        <SystemCard latest={data.latest} timezone={data.site.timezone} now={now} />
      </div>
      <p className="flex items-start gap-2 rounded-2xl border border-info/20 bg-info-soft px-4 py-3 text-sm text-ink-muted">
        <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
        <span>
          <b className="font-semibold text-ink">How it works:</b> readings are checked against plain-language rules. Alerts reach the team on
          the dashboard and by SMS, even without internet. AquaSentinel watches and coordinates; it never controls the pump.
        </span>
      </p>
      <Journey active={data.active} recent={data.recent} />
      <ActionCenter tasks={tasks} checks={data.checks} canCheck={canCheck} timezone={data.site.timezone} onRefresh={reload} />
    </div>
  );
}
