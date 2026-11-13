import { afterEach, describe, expect, it, vi } from "vitest";
import { buildHealthReport, checkSupabase } from "@/lib/health";
import { getAppEnvironment } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

const okFetch = vi.fn(async () => new Response("{}", { status: 200 }));
const failingFetch = vi.fn(async () => {
  throw new Error("network down");
});

describe("getAppEnvironment", () => {
  it("accepts known environments and falls back to local", () => {
    expect(getAppEnvironment("production")).toBe("production");
    expect(getAppEnvironment("development")).toBe("development");
    expect(getAppEnvironment("staging")).toBe("local");
    expect(getAppEnvironment(undefined)).toBe("local");
  });
});

describe("checkSupabase", () => {
  it("reports not_configured when env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(await checkSupabase(okFetch)).toBe("not_configured");
  });

  it("calls the Auth health endpoint with the publishable key", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(await checkSupabase(okFetch)).toBe("ok");
    expect(okFetch).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/health",
      expect.objectContaining({ headers: { apikey: "sb_publishable_test" } }),
    );
  });

  it("reports unreachable on network failure", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    expect(await checkSupabase(failingFetch)).toBe("unreachable");
  });
});

describe("buildHealthReport", () => {
  it("is degraded when Supabase is unreachable and includes the commit SHA", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abc1234");
    const report = await buildHealthReport(failingFetch, new Date("2026-01-01T00:00:00Z"));
    expect(report).toMatchObject({
      status: "degraded",
      commitSha: "abc1234",
      checks: { supabase: "unreachable" },
      checkedAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
