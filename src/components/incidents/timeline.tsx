import { MessageSquareText, Monitor, Radio, Cpu } from "lucide-react";
import type { TimelineEntry } from "@/lib/data/use-incident";
import { formatSiteTime } from "@/lib/format";
import { timelineLabel } from "@/lib/incidents";

const CHANNEL = {
  web: { label: "Web", icon: Monitor },
  sms: { label: "SMS", icon: MessageSquareText },
  system: { label: "System", icon: Radio },
  device: { label: "Device", icon: Cpu },
} as const;

/** Who did what, when, and through which channel. Read from the append-only audit log. */
export function Timeline({ entries, timezone }: { entries: TimelineEntry[]; timezone: string }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-line pl-5">
      {entries.map((e) => {
        const ch = CHANNEL[e.channel];
        const Icon = ch.icon;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[1.85rem] top-0.5 grid size-5 place-items-center rounded-full border-2 border-surface bg-teal-600 text-white">
              <Icon className="size-2.5" aria-hidden />
            </span>
            <p className="text-sm font-medium text-ink">{timelineLabel(e.action, e.details)}</p>
            <p className="text-xs text-ink-muted">
              {formatSiteTime(e.occurred_at, timezone)} · {ch.label}
              {e.actor_name ? ` · ${e.actor_name}` : ""}
            </p>
            {e.action === "closed" && typeof e.details.reason === "string" && (
              <p className="mt-1 text-xs text-ink-muted">&ldquo;{e.details.reason}&rdquo;</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
