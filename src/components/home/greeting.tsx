import { Clock } from "lucide-react";
import type { SiteData } from "@/lib/data/site-data";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { firstName, greeting, statusSentence } from "@/lib/greeting";
import { cn } from "@/lib/cn";

const EMPHASIS: Record<string, string> = {
  info: "text-accent",
  warn: "text-warn",
  crit: "text-crit",
  off: "text-off",
  ok: "text-ok",
};

/** The first answer on the screen: "Is my water OK?", in words, in the site's time zone. */
export function Greeting({ name, site, now }: { name: string; site: SiteData["site"]; now: number }) {
  const s = statusSentence(site.status);
  const age = secondsSince(site.last_reading_at, now);
  return (
    <section className="relative isolate md:pb-4">
      <div className="water-header" aria-hidden />
      <h1 className="type-h1 max-w-3xl text-ink">
        {greeting(site.timezone, new Date(now))}
        {firstName(name) ? `, ${firstName(name)}.` : "."}
        <br />
        {s.lead} <em className={cn("italic", EMPHASIS[s.tone])}>{s.emphasis}</em>
      </h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
        <span>{site.name}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          Updated {formatAge(age)}
        </span>
        {site.last_reading_at && <span className="text-ink-subtle">({formatSiteTime(site.last_reading_at, site.timezone)})</span>}
      </p>
    </section>
  );
}
