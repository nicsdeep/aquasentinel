"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

export type Role = "operator" | "technician" | "committee" | "admin";

export interface Membership {
  siteId: string;
  role: Role;
  siteName: string;
  timezone: string;
  isSimulated: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  locale: "en" | "sw";
  isDemo: boolean;
  /** Platform administrator: may switch their own role and manage team members (People console). */
  isPlatformAdmin: boolean;
}

type SessionState =
  | { status: "loading" }
  | { status: "signed_out" }
  | { status: "unconfigured" }
  | { status: "signed_in"; user: User; profile: Profile | null; memberships: Membership[] };

const SessionContext = createContext<(SessionState & { signOut: () => Promise<void>; refresh: () => Promise<void> }) | null>(null);

interface MembershipRow {
  site_id: string;
  role: Role;
  sites: { name: string; timezone: string; is_simulated: boolean } | null;
}

async function loadAccount(user: User) {
  const supabase = getSupabase()!;
  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, locale, is_demo, is_platform_admin").eq("id", user.id).maybeSingle(),
    supabase.from("site_members").select("site_id, role, sites(name, timezone, is_simulated)").eq("user_id", user.id),
  ]);
  return {
    profile: profile
      ? { id: profile.id, fullName: profile.full_name, locale: profile.locale, isDemo: profile.is_demo, isPlatformAdmin: profile.is_platform_admin }
      : null,
    memberships: ((rows ?? []) as unknown as MembershipRow[]).map((r) => ({
      siteId: r.site_id,
      role: r.role,
      siteName: r.sites?.name ?? "Site",
      timezone: r.sites?.timezone ?? "Africa/Nairobi",
      isSimulated: r.sites?.is_simulated ?? false,
    })),
  };
}

/** Current user, profile and site roles. Access control itself is enforced in the database (RLS). */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(() =>
    getSupabase() ? { status: "loading" } : { status: "unconfigured" },
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let active = true;
    const apply = async (user: User | null) => {
      if (!user) {
        if (active) setState({ status: "signed_out" });
        return;
      }
      const account = await loadAccount(user);
      if (active) setState({ status: "signed_in", user, ...account });
    };
    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") apply(null);
      if (event === "SIGNED_IN" && session?.user) apply(session.user);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Role changes (a role switch, or an administrator changing this person's role) apply live, without a reload.
  const userId = state.status === "signed_in" ? state.user.id : null;
  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!data.user) return;
    const account = await loadAccount(data.user);
    setState({ status: "signed_in", user: data.user, ...account });
  }, []);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;
    const channel = supabase
      .channel(`members-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_members", filter: `user_id=eq.${userId}` }, () => void refresh())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  const value = useMemo(() => ({ ...state, signOut, refresh }), [state, signOut, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  operator: "Operator",
  technician: "Technician",
  committee: "Water committee",
  admin: "Administrator",
};
