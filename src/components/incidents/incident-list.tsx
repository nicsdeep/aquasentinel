"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, CircleCheck, Megaphone, OctagonAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useShell } from "@/components/shell/shell-context";
import { useSession } from "@/lib/auth/session";
import type { IncidentStatus, Outcome, Severity } from "@/lib/data/types";
import { formatSiteTime } from "@/lib/format";
import { OUTCOME_LABEL, SEVERITY, STATUS_LABEL, STATUS_TONE } from "@/lib/incidents";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface Row {
  id: string;
  reference: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  outcome: Outcome | null;
  detected_at: string;
  assignee: { full_name: string } | null;
}

/** Open and closed incidents in one compact, familiar table. The tab lives in the URL, so Back keeps context. */
export function IncidentList() {
  const session = useSession();
  const shell = useShell();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = params.get("tab") === "closed" ? "closed" : "open";
  const membership = session.status === "signed_in" ? session.memberships[0] : undefined;
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    if (!membership) return;
    const { data } = await getSupabase()!
      .from("incidents")
      .select("id, reference, title, severity, status, outcome, detected_at, assignee:profiles!incidents_assigned_to_fkey(full_name)")
      .eq("site_id", membership.siteId)
      .order("detected_at", { ascending: false })
      .limit(100);
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

  const tz = membership?.timezone ?? "Africa/Nairobi";
  const open = (rows ?? []).filter((r) => r.status !== "closed");
  const closed = (rows ?? []).filter((r) => r.status === "closed");
  const list = tab === "open" ? open : closed;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Maintenance record</Eyebrow>
          <h1 className="type-h1 mt-2">Alerts &amp; incidents</h1>
        </div>
        <Button variant="secondary" onClick={shell.openReport}>
          <Megaphone className="size-4" aria-hidden />
          Report a problem
        </Button>
      </header>

      <div className="inline-flex rounded-full bg-surface-muted p-1" role="tablist" aria-label="Incidents">
        {(["open", "closed"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => router.replace(t === "open" ? pathname : `${pathname}?tab=closed`, { scroll: false })}
            className={cn("min-h-10 rounded-full px-5 text-sm font-medium", tab === t ? "bg-surface text-ink shadow-sm" : "text-ink-muted")}
          >
            {t === "open" ? `Open (${open.length})` : `Closed (${closed.length})`}
          </button>
        ))}
      </div>

      {!rows ? (
        <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" aria-label="Loading" />
      ) : list.length === 0 ? (
        <p className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted">
          <CircleCheck className="size-4 text-ok" aria-hidden />
          {tab === "open" ? "No open incidents. Water is flowing as expected." : "No closed incidents yet."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-subtle">
                <th className="px-5 py-3 font-medium">Incident</th>
                <th className="hidden px-2 py-3 font-medium md:table-cell">Detected</th>
                <th className="hidden px-2 py-3 font-medium sm:table-cell">{tab === "open" ? "Responsible" : "Outcome"}</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const Icon = r.status === "closed" ? CircleCheck : r.severity === "needs_attention" ? OctagonAlert : TriangleAlert;
                const iconCls = r.status === "closed" ? "text-ink-subtle" : r.severity === "needs_attention" ? "text-crit" : "text-warn";
                return (
                  <tr key={r.id} className="relative border-b border-line last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3">
                      <Link href={`/incidents/${r.id}`} className="flex items-center gap-3 after:absolute after:inset-0">
                        <Icon className={cn("size-[18px] shrink-0", iconCls)} aria-label={r.status === "closed" ? "Closed" : SEVERITY[r.severity].label} />
                        <span className="min-w-0">
                          <span className="block font-medium">{r.title}</span>
                          <span className="block text-xs text-ink-muted md:hidden">{r.reference} · {formatSiteTime(r.detected_at, tz)}</span>
                          <span className="hidden text-xs text-ink-muted md:block">{r.reference}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-2 py-3 text-ink-muted md:table-cell">{formatSiteTime(r.detected_at, tz)}</td>
                    <td className="hidden px-2 py-3 text-ink-muted sm:table-cell">
                      {tab === "open" ? r.assignee?.full_name ?? "Unassigned" : r.outcome ? OUTCOME_LABEL[r.outcome] : "—"}
                    </td>
                    <td className="px-2 py-3"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
                    <td className="pr-4"><ChevronRight className="size-4 text-ink-subtle" aria-hidden /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
