import { cn } from "@/lib/cn";
import { SITE_STATUS, TONE_CLASSES, type SiteStatus, type Tone } from "@/lib/status";

export function Badge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Site state: icon + word + colour. */
export function StatusBadge({ status, size = "md" }: { status: SiteStatus; size?: "md" | "lg" }) {
  const meta = SITE_STATUS[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        TONE_CLASSES[meta.tone],
        size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} aria-hidden />
      {meta.label}
    </span>
  );
}
