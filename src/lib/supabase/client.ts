"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requirePublicSupabaseConfig } from "@/lib/env";

/** Supabase client for Client Components. Access is limited by RLS to the signed-in user. */
export function createClient() {
  const { url, publishableKey } = requirePublicSupabaseConfig();
  return createBrowserClient(url, publishableKey);
}
