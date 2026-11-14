"use client";

import { MessageSquareText, Megaphone } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";
import type { SiteData } from "@/lib/data/site-data";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { firstName, greeting, statusPhrase } from "@/lib/greeting";
import type { Tone } from "@/lib/status";
import { cn } from "@/lib/cn";

// The emphasised phrase uses the brand aqua when all is well, status colours otherwise.
const COLOR: Record<Tone, string> = { ok: "text-as-teal-strong", info: "text-as-teal-strong", warn: "text-warn", crit: "text-crit", off: "text-off" };
const DOT: Record<Tone, string> = { ok: "bg-ok", info: "bg-ok", warn: "bg-warn", crit: "bg-crit", off: "bg-off" };

/**
 * The first answer on the screen, in words: who you are, and whether the water system is OK.
 * `orange` decides whether "Report a problem" carries the one orange action (only when nothing else needs it).
 */
export function Hero({ name, site, now, orange }: { name: string; site: SiteData["site"]; now: number; orange: boolean }) {
  const shell = useShell();
  const p = statusPhrase(site.status);
  const age = secondsSince(site.last_reading_at, now);
  const who = firstName(name);
  return (
    <section className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="home-glow" aria-hidden />
      <div className="relative min-w-0 flex-1">
        <h1 className="font-serif text-[clamp(40px,5.2vw,72px)] leading-[0.98] tracking-[-0.025em] text-ink">
          {greeting(site.timezone, new Date(now))}
          {who ? `, ${who}.` : "."} <em className={cn("italic", COLOR[p.tone])}>{p.text}</em>
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-ink-muted">
          <span>{site.name}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", DOT[p.tone])} aria-hidden />
            Updated {formatAge(age)}
            {site.last_reading_at && <span className="text-ink-subtle">({formatSiteTime(site.last_reading_at, site.timezone)})</span>}
          </span>
        </p>
      </div>
      <div className="relative flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-end">
        <button onClick={shell.openMessages} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-semibold shadow-sm hover:bg-surface-muted">
          <MessageSquareText className="size-4" aria-hidden />
          Messages
        </button>
        <button
          onClick={shell.openReport}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white shadow-sm",
            orange ? "bg-as-orange hover:brightness-95" : "bg-as-dark hover:bg-as-deep",
          )}
        >
          <Megaphone className="size-4" aria-hidden />
          Report a problem
        </button>
      </div>
    </section>
  );
}
