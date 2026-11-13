"use client";

import { Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Phone } from "@/components/sms/phone";
import { useSession } from "@/lib/auth/session";
import { useSiteData } from "@/lib/data/use-site-data";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { DemoControls } from "./demo-controls";
import { HistoryChart } from "./history-chart";
import { NextAction } from "./next-action";
import { ReadingCards } from "./reading-cards";
import { SiteInfo } from "./site-info";

export function Dashboard() {
  const session = useSession();
  const now = useNow();
  const membership = session.status === "signed_in" ? session.memberships[0] : undefined;
  const { data, error, reload } = useSiteData(membership?.siteId);

  if (session.status !== "signed_in") return null;
  if (!membership) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-semibold">No water system yet</h1>
        <p className="mt-1 text-ink-muted">Your account is not linked to a site. Ask an administrator to add you.</p>
      </Card>
    );
  }
  if (error && !data) {
    return (
      <Card className="p-6" role="alert">
        <p className="font-semibold text-crit">{error}</p>
      </Card>
    );
  }
  if (!data) {
    return (
      <div className="space-y-4" aria-label="Loading">
        <div className="h-24 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-28 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
      </div>
    );
  }

  const { site } = data;
  const age = secondsSince(site.last_reading_at, now);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-5">
        <header>
          <Eyebrow>Water system</Eyebrow>
          <h1 className="type-h1 mt-2 text-ink">{site.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {site.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              Updated {formatAge(age)}
              {site.last_reading_at && (
                <span className="text-ink-subtle">({formatSiteTime(site.last_reading_at, site.timezone)})</span>
              )}
            </span>
          </p>
        </header>
        <NextAction site={site} active={data.active} />
        <ReadingCards latest={data.latest} timezone={site.timezone} now={now} />
        <HistoryChart history={data.history} timezone={site.timezone} />
      </div>

      <aside className="space-y-5">
        <section aria-labelledby="sms-title">
          <h2 id="sms-title" className="type-h2 mb-3 text-ink">
            Your SMS
          </h2>
          <Phone userId={session.user.id} locale={session.profile?.locale ?? "en"} timezone={site.timezone} />
        </section>
        {(membership.role === "committee" || membership.role === "admin") && <DemoControls siteId={site.site_id} onDone={reload} />}
        <SiteInfo assets={data.assets} devices={data.devices} now={now} />
      </aside>
    </div>
  );
}
