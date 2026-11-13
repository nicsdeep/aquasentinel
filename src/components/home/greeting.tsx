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
    <section className="relative overflow-hidden">
      <WaterTower className="pointer-events-none absolute -right-2 -top-4 hidden h-44 w-44 text-as-teal/50 lg:block" />
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

/** Minimal line drawing of an elevated tank: quiet context, not decoration (no photos on work screens). */
function WaterTower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden>
      <ellipse cx="60" cy="22" rx="22" ry="5" />
      <path d="M38 22v26c0 3 10 5 22 5s22-2 22-5V22" />
      <path d="M38 34c0 3 10 5 22 5s22-2 22-5" opacity="0.5" />
      <path d="M44 53 36 104M76 53l8 51M60 53v51M40 78h40M38 92h44" />
      <path d="M10 108c8-4 16-4 24 0s16 4 24 0 16-4 24 0 16 4 24 0" />
    </svg>
  );
}
