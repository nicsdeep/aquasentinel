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
const DOT: Record<string, string> = { info: "bg-ok", ok: "bg-ok", warn: "bg-warn", crit: "bg-crit", off: "bg-off" };

/** The first answer on the screen: "Is my water OK?", in words, in the site's time zone. */
export function Greeting({ name, site, now }: { name: string; site: SiteData["site"]; now: number }) {
  const s = statusSentence(site.status);
  const age = secondsSince(site.last_reading_at, now);
  return (
    <section className="relative max-w-3xl">
      <h1 className="text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
        {greeting(site.timezone, new Date(now))}
        {firstName(name) ? `, ${firstName(name)}.` : "."}
      </h1>
      <p className="mt-1 text-[clamp(22px,2.4vw,32px)] font-medium leading-tight tracking-[-0.015em] text-ink">
        {s.lead} <em className={cn("font-bold italic", EMPHASIS[s.tone])}>{s.emphasis}</em>
      </p>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
        <span className="font-medium text-ink">{site.name}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", DOT[s.tone])} aria-hidden />
          Updated {formatAge(age)}
          {site.last_reading_at && <span>({formatSiteTime(site.last_reading_at, site.timezone)})</span>}
        </span>
      </p>
    </section>
  );
}
