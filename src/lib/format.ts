/** "just now", "4 min ago", "2 h ago", "3 days ago" — always explicit about data age (PROJECT_RULES §5). */
export function formatAge(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return "never";
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.floor(h / 24)} days ago`;
}

/** Seconds elapsed since an ISO timestamp, relative to `now`. */
export function secondsSince(iso: string | null | undefined, now: number = Date.now()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : (now - t) / 1000;
}

/** Local date-time in the site's time zone, with the zone shown (PROJECT_RULES §6). */
export function formatSiteTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(new Date(iso));
}
