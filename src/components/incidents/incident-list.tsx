"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth/session";
import type { IncidentStatus, Severity } from "@/lib/data/types";
import { formatSiteTime } from "@/lib/format";
import { SEVERITY, STATUS_LABEL, STATUS_TONE } from "@/lib/incidents";
import { getSupabase } from "@/lib/supabase/client";

interface Row {
  id: string;
  reference: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  detected_at: string;
  assignee: { full_name: string } | null;
}

function IncidentRows({ items, tz }: { items: Row[]; tz: string }) {
  return (
    <Card className="divide-y divide-line overflow-hidden">
      {items.map((r) => {
        const Icon = r.status === "closed" ? CircleCheck : r.severity === "needs_attention" ? OctagonAlert : TriangleAlert;
        return (
          <Link key={r.id} href={`/incidents/${r.id}`} className="flex min-h-16 items-center gap-4 px-5 py-3 hover:bg-surface-muted">
            <Icon className={r.status === "closed" ? "size-5 shrink-0 text-ink-subtle" : r.severity === "needs_attention" ? "size-5 shrink-0 text-crit" : "size-5 shrink-0 text-warn"} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{r.title}</p>
              <p className="text-xs text-ink-muted">
                {r.reference} · {formatSiteTime(r.detected_at, tz)}
                {r.assignee ? ` · ${r.assignee.full_name}` : ""}
              </p>
            </div>
            <div className="hidden shrink-0 gap-1.5 sm:flex">
              {r.status !== "closed" && <Badge tone={SEVERITY[r.severity].tone}>{SEVERITY[r.severity].label}</Badge>}
              <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            </div>
            <ChevronRight className="size-5 shrink-0 text-ink-subtle" aria-hidden />
          </Link>
        );
      })}
    </Card>
  );
}

/** Open incidents first, then recent history: the record that lets the community learn from every failure. */
export function IncidentList() {
  const session = useSession();
  const membership = session.status === "signed_in" ? session.memberships[0] : undefined;
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    if (!membership) return;
    const { data } = await getSupabase()!
      .from("incidents")
      .select("id, reference, title, severity, status, detected_at, assignee:profiles!incidents_assigned_to_fkey(full_name)")
      .eq("site_id", membership.siteId)
      .order("detected_at", { ascending: false })
      .limit(50);
    setRows((data ?? []) as unknown as Row[]);
  }, [membership]);

  useEffect(() => {
    if (!membership) return;
    const db = getSupabase()!;
    const first = setTimeout(load, 0);
    const channel = db
      .channel(`incidents-${membership.siteId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents", filter: `site_id=eq.${membership.siteId}` }, () => load())
      .subscribe();
    return () => {
      clearTimeout(first);
      db.removeChannel(channel);
    };
  }, [membership, load]);

  if (!rows) return <div className="h-48 animate-pulse rounded-card bg-surface-muted" aria-label="Loading" />;

  const open = rows.filter((r) => r.status !== "closed");
  const closed = rows.filter((r) => r.status === "closed");
  const tz = membership?.timezone ?? "Africa/Nairobi";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Incidents</h1>
        <p className="mt-1 text-ink-muted">Every alert, response and repair, kept as the site&apos;s maintenance record.</p>
      </header>
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Open ({open.length})</h2>
        {open.length ? <IncidentRows items={open} tz={tz} /> : <p className="rounded-card border border-line bg-surface p-5 text-sm text-ink-muted">No open incidents. Water is flowing as expected.</p>}
      </section>
      {closed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Closed</h2>
          <IncidentRows items={closed} tz={tz} />
        </section>
      )}
    </div>
  );
}
