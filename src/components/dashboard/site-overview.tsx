"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SimulatedBadge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth/session";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { SITE_STATUS, TONE_CLASSES, isSiteStatus, type SiteStatus } from "@/lib/status";
import { getSupabase } from "@/lib/supabase/client";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/cn";

interface SiteStatusRow {
  site_id: string;
  name: string;
  location: string;
  timezone: string;
  is_simulated: boolean;
  last_reading_at: string | null;
  active_incidents: number;
  status: SiteStatus;
}

export function SiteOverview() {
  const session = useSession();
  const now = useNow();
  const [site, setSite] = useState<SiteStatusRow | null>(null);
  const [error, setError] = useState(false);
  const siteId = session.status === "signed_in" ? session.memberships[0]?.siteId : undefined;

  useEffect(() => {
    if (!siteId) return;
    getSupabase()!
      .from("site_status")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (queryError || !data || !isSiteStatus(data.status)) setError(true);
        else setSite(data as SiteStatusRow);
      });
  }, [siteId]);

  if (session.status === "signed_in" && session.memberships.length === 0) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-semibold">No water system yet</h1>
        <p className="mt-1 text-ink-muted">Your account is not linked to a site. Ask an administrator to add you.</p>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="p-6" role="alert">
        <p className="font-semibold text-crit">Could not load the site status. Check your connection and try again.</p>
      </Card>
    );
  }
  if (!site) {
    return <div className="h-40 animate-pulse rounded-card bg-surface-muted" aria-label="Loading site status" />;
  }

  const meta = SITE_STATUS[site.status];
  const age = secondsSince(site.last_reading_at, now);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">Water system</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{site.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="size-4" aria-hidden />
            {site.location}
          </p>
        </div>
        {site.is_simulated && <SimulatedBadge />}
      </header>

      <section
        className={cn("flex items-center gap-4 rounded-card border border-current/15 p-5", TONE_CLASSES[meta.tone])}
        aria-label={`Site status: ${meta.label}`}
      >
        <meta.icon className="size-9 shrink-0" aria-hidden />
        <div>
          <p className="text-xl font-bold">{meta.label}</p>
          <p className="text-sm opacity-90">{meta.summary}</p>
        </div>
      </section>

      <p className="flex items-center gap-1.5 text-sm text-ink-muted">
        <Clock className="size-4" aria-hidden />
        Last reading {formatAge(age)}
        {site.last_reading_at && <span className="text-ink-subtle">({formatSiteTime(site.last_reading_at, site.timezone)})</span>}
      </p>
    </div>
  );
}
