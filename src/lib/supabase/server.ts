import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Acts as the signed-in user (RLS applies). Never use the secret key here.
 */
export async function createClient() {
  const { url, publishableKey } = requirePublicSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only; safe to ignore
          // as long as session refresh happens in a proxy/middleware or route handler.
        }
      },
    },
  });
}
