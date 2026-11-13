import { getAppEnvironment, getBuildInfo, getPublicSupabaseConfig } from "@/lib/env";

export type DependencyStatus = "ok" | "unreachable" | "not_configured";

export interface HealthReport {
  status: "ok" | "degraded";
  app: "aquasentinel";
  environment: ReturnType<typeof getAppEnvironment>;
  commitSha: string;
  vercelEnv: string;
  checks: { supabase: DependencyStatus };
  checkedAt: string;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Checks that the configured Supabase project answers (Auth health endpoint).
 * Uses only the publishable key; no secrets are involved.
 */
export async function checkSupabase(fetcher: Fetcher = fetch, timeoutMs = 3000): Promise<DependencyStatus> {
  const config = getPublicSupabaseConfig();
  if (!config) return "not_configured";
  try {
    const res = await fetcher(`${config.url}/auth/v1/health`, {
      headers: { apikey: config.publishableKey },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return res.ok ? "ok" : "unreachable";
  } catch {
    return "unreachable";
  }
}

export async function buildHealthReport(fetcher: Fetcher = fetch, now = new Date()): Promise<HealthReport> {
  const supabase = await checkSupabase(fetcher);
  const build = getBuildInfo();
  return {
    status: supabase === "unreachable" ? "degraded" : "ok",
    app: "aquasentinel",
    environment: getAppEnvironment(),
    commitSha: build.commitSha,
    vercelEnv: build.vercelEnv,
    checks: { supabase },
    checkedAt: now.toISOString(),
  };
}
