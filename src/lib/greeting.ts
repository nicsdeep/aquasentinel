import type { SiteStatus, Tone } from "@/lib/status";

/** "Good morning" / "Good afternoon" / "Good evening" in the site's own time zone. */
export function greeting(timeZone: string, at: Date = new Date()): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(at)) % 24;
  if (hour < 4) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** First name for a friendly greeting ("Mwende Musyoka" → "Mwende"). */
export function firstName(fullName: string | undefined | null): string {
  return (fullName ?? "").trim().split(/\s+/)[0] ?? "";
}

/**
 * The headline answer to "Is my water OK?": a short phrase after the greeting, coloured by the status tone
 * (never colour alone: the words carry the meaning).
 */
export function statusPhrase(status: SiteStatus): { text: string; tone: Tone } {
  switch (status) {
    case "normal":
      return { text: "Running well.", tone: "ok" };
    case "warning":
      return { text: "Needs a check.", tone: "warn" };
    case "needs_attention":
      return { text: "Needs attention.", tone: "crit" };
    case "offline":
      return { text: "Not reporting.", tone: "off" };
  }
}
