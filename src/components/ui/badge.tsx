import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";
import { SITE_STATUS, TONE_CLASSES, type SiteStatus, type Tone } from "@/lib/status";

export function Badge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
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

/** Every demonstration value carries this label (PROJECT_RULES §8). */
export function SimulatedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="sim" className={cn("uppercase tracking-wide", className)}>
      <FlaskConical className="size-3" aria-hidden />
      Simulated
    </Badge>
  );
}
