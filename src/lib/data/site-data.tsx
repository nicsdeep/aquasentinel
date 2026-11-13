"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { AssetRow, DeviceRow, HistoryPoint, IncidentSummary, LatestReading, Member, RoutineCheck, SiteRow } from "./types";

export interface SiteData {
  site: SiteRow & { description: string | null };
  latest: LatestReading[];
  history: HistoryPoint[];
  active: IncidentSummary[];
  assets: AssetRow[];
  devices: DeviceRow[];
  members: Member[];
  /** Routine checks logged in the last 24 hours, newest first. */
  checks: RoutineCheck[];
}

const INCIDENT_FIELDS = "id, reference, title, severity, status, detected_at, evidence, assigned_to, assigned_at, diagnosis";

/**
 * Everything the operator screens show for one site, loaded once and shared through context, kept current by
 * Supabase Realtime (readings, incidents, SMS) so no screen needs a manual refresh (PROJECT_RULES §6).
 */
function useSiteDataSource(siteId: string | undefined) {
  const [data, setData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!siteId) return;
    const db = getSupabase()!;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const [site, desc, latest, history, active, assets, devices, members, checks] = await Promise.all([
      db.from("site_status").select("site_id, name, location, timezone, last_reading_at, active_incidents, status").eq("site_id", siteId).maybeSingle(),
      db.from("sites").select("description").eq("id", siteId).maybeSingle(),
      db.from("latest_readings").select("metric, value, unit, measured_at").eq("site_id", siteId),
      db.from("readings").select("metric, value, measured_at").eq("site_id", siteId)
        .in("metric", ["tank_level", "flow_rate", "solar_power"]).gte("measured_at", since).order("measured_at").limit(3000),
      db.from("incidents").select(INCIDENT_FIELDS).eq("site_id", siteId).neq("status", "closed").order("detected_at", { ascending: false }),
      db.from("assets").select("id, kind, name, details").eq("site_id", siteId).order("created_at"),
      db.from("device_health").select("id, name, connection, last_seen_at, is_simulated").eq("site_id", siteId),
      db.from("site_members").select("user_id, role, profiles(full_name)").eq("site_id", siteId),
      db.from("audit_log").select("occurred_at, details, actor:profiles(full_name)").eq("site_id", siteId)
        .eq("action", "routine_check").gte("occurred_at", since).order("occurred_at", { ascending: false }),
    ]);
    const failed = [site, desc, latest, history, active, assets, devices, members, checks].find((r) => r.error);
    if (failed?.error || !site.data) {
      setError("Could not load the site. Check your connection and try again.");
      return;
    }
    setError(null);
    setData({
      site: { ...(site.data as SiteRow), description: desc.data?.description ?? null },
      latest: (latest.data ?? []) as LatestReading[],
      history: (history.data ?? []) as HistoryPoint[],
      active: (active.data ?? []) as IncidentSummary[],
      assets: (assets.data ?? []) as AssetRow[],
      devices: (devices.data ?? []) as DeviceRow[],
      members: ((members.data ?? []) as unknown as { user_id: string; role: Member["role"]; profiles: { full_name: string } | null }[]).map(
        (m) => ({ user_id: m.user_id, role: m.role, full_name: m.profiles?.full_name ?? "Team member" }),
      ),
      checks: ((checks.data ?? []) as unknown as { occurred_at: string; details: { issues?: number }; actor: { full_name: string } | null }[]).map(
        (c) => ({ occurred_at: c.occurred_at, actor_name: c.actor?.full_name ?? null, issues: c.details?.issues ?? 0 }),
      ),
    });
  }, [siteId]);

  useEffect(() => {
    if (!siteId) return;
    const db = getSupabase()!;
    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(load, 400);
    };
    schedule();
    const channel = db.channel(`site-${siteId}`);
    for (const table of ["readings", "incidents", "sms_messages", "audit_log"]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `site_id=eq.${siteId}` }, schedule);
    }
    channel.subscribe();
    // Safety net when a realtime connection drops (e.g. weak mobile signal).
    const poll = setInterval(schedule, 60_000);
    return () => {
      clearInterval(poll);
      if (timer.current) clearTimeout(timer.current);
      db.removeChannel(channel);
    };
  }, [siteId, load]);

  return { data, error, reload: load };
}

const SiteDataContext = createContext<ReturnType<typeof useSiteDataSource> | null>(null);

export function SiteDataProvider({ siteId, children }: { siteId: string | undefined; children: React.ReactNode }) {
  const source = useSiteDataSource(siteId);
  return <SiteDataContext.Provider value={source}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used inside <SiteDataProvider>");
  return ctx;
}
