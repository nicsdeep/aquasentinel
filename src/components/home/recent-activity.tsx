import Link from "next/link";
import {
  ArrowRight, CircleCheck, ClipboardCheck, History, Megaphone, MessageSquare, TriangleAlert, UserRound, Waves, Wrench, type LucideIcon,
} from "lucide-react";
import type { RecentEvent } from "@/lib/data/types";
import { timelineLabel } from "@/lib/incidents";
import { TONE_CLASSES, type Tone } from "@/lib/status";
import { cn } from "@/lib/cn";

const ICON: Record<string, [LucideIcon, Tone]> = {
  detected: [TriangleAlert, "crit"],
  reported: [Megaphone, "crit"],
  additional_report: [Megaphone, "warn"],
  notified: [MessageSquare, "info"],
  acknowledged: [CircleCheck, "info"],
  assigned: [UserRound, "info"],
  work_recorded: [Wrench, "info"],
  recovery_verified: [Waves, "ok"],
  close_requested: [ClipboardCheck, "info"],
  closed: [CircleCheck, "ok"],
};

/** The latest things that happened on the site, from the audit trail. Each line opens its incident. */
export function RecentActivity({ events, timezone }: { events: RecentEvent[]; timezone: string }) {
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <History className="size-6 text-accent" aria-hidden />
          Recent activity
        </h2>
        <Link href="/incidents?tab=closed" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
          View all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="px-5 pb-5 pt-1 text-sm text-ink-muted">Nothing has happened yet.</p>
      ) : (
        <ul className="divide-y divide-line px-3 pb-3">
          {events.slice(0, 4).map((e) => {
            const [Icon, tone] = ICON[e.action] ?? [History, "off" as Tone];
            return (
              <li key={e.id}>
                <Link href={`/incidents/${e.incident_id}`} className="flex min-h-14 items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-muted">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", TONE_CLASSES[tone])}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold text-ink">{e.title}</span>
                    <span className="block truncate text-sm text-ink-muted">{timelineLabel(e.action, e.details)}</span>
                  </span>
                  <time dateTime={e.occurred_at} className="tabular shrink-0 text-sm text-ink-muted">{time.format(new Date(e.occurred_at))}</time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
