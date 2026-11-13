import { describe, expect, it } from "vitest";
import { formatAge, formatSiteTime, secondsSince } from "@/lib/format";
import { SITE_STATUS, isSiteStatus } from "@/lib/status";

describe("formatAge", () => {
  it("states data age in plain language", () => {
    expect(formatAge(null)).toBe("never");
    expect(formatAge(20)).toBe("just now");
    expect(formatAge(4 * 60 + 10)).toBe("4 min ago");
    expect(formatAge(3 * 3600)).toBe("3 h ago");
    expect(formatAge(3 * 86400)).toBe("3 days ago");
  });
});

describe("secondsSince", () => {
  it("measures age from an ISO timestamp", () => {
    expect(secondsSince("2026-01-01T00:00:00Z", Date.parse("2026-01-01T00:05:00Z"))).toBe(300);
    expect(secondsSince(null)).toBeNull();
    expect(secondsSince("not a date")).toBeNull();
  });
});

describe("formatSiteTime", () => {
  it("shows the site's local time with its zone", () => {
    expect(formatSiteTime("2026-11-13T08:55:00Z", "Africa/Nairobi")).toMatch(/11:55.*EAT/);
  });
});

describe("site status vocabulary", () => {
  it("has exactly the four plain-language states, each with icon, word and tone", () => {
    expect(Object.keys(SITE_STATUS)).toEqual(["normal", "warning", "needs_attention", "offline"]);
    for (const meta of Object.values(SITE_STATUS)) {
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.icon).toBeTruthy();
    }
    expect(isSiteStatus("offline")).toBe(true);
    expect(isSiteStatus("broken")).toBe(false);
  });
});
