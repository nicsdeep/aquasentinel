"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Supabase client for the browser (one shared instance). Uses only the publishable key: every read is limited
 * by Row Level Security and every write goes through role-checked database functions.
 * Returns null when the app is not configured (e.g. CI smoke builds).
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const config = getPublicSupabaseConfig();
  if (!config) return null;
  client = createBrowserClient(config.url, config.publishableKey);
  return client;
}
