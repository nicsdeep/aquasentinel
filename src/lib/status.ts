import { CircleCheck, OctagonAlert, TriangleAlert, WifiOff, type LucideIcon } from "lucide-react";

/**
 * The four plain-language site states (PROJECT_RULES §6). Each pairs colour with an icon and a word,
 * so meaning never depends on colour alone.
 */
export type SiteStatus = "normal" | "warning" | "needs_attention" | "offline";

export type Tone = "ok" | "warn" | "crit" | "off" | "info" | "sim";

export const SITE_STATUS: Record<SiteStatus, { label: string; summary: string; icon: LucideIcon; tone: Tone }> = {
  normal: { label: "Normal", summary: "Water is flowing as expected.", icon: CircleCheck, tone: "ok" },
  warning: { label: "Warning", summary: "Something is drifting from normal. Check it soon.", icon: TriangleAlert, tone: "warn" },
  needs_attention: {
    label: "Needs attention",
    summary: "Water service is at risk. Act now.",
    icon: OctagonAlert,
    tone: "crit",
  },
  offline: {
    label: "Offline",
    summary: "No recent data from the site. Readings may be out of date.",
    icon: WifiOff,
    tone: "off",
  },
};

export function isSiteStatus(value: unknown): value is SiteStatus {
  return typeof value === "string" && value in SITE_STATUS;
}

/** Tailwind classes per tone (foreground + soft background), shared by badges, banners and cards. */
export const TONE_CLASSES: Record<Tone, string> = {
  ok: "text-ok bg-ok-soft",
  warn: "text-warn bg-warn-soft",
  crit: "text-crit bg-crit-soft",
  off: "text-off bg-off-soft",
  info: "text-info bg-info-soft",
  sim: "text-sim bg-sim-soft",
};
