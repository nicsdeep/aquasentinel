/**
 * Central, typed access to runtime configuration.
 * Never read process.env directly elsewhere — add it here so every variable is documented
 * (see docs/ENVIRONMENTS.md and .env.example).
 */

export type AppEnvironment = "local" | "development" | "production";

const APP_ENVIRONMENTS: readonly AppEnvironment[] = ["local", "development", "production"];

export function getAppEnvironment(value = process.env.NEXT_PUBLIC_APP_ENV): AppEnvironment {
  return APP_ENVIRONMENTS.includes(value as AppEnvironment) ? (value as AppEnvironment) : "local";
}

/** Public Supabase settings. The publishable key is safe in the browser ONLY because RLS is enforced. */
export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** Build metadata injected by Vercel (or CI). Used to verify which commit is live. */
export function getBuildInfo() {
  return {
    commitSha: process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "none",
  };
}
