"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { AssetRow, DeviceRow, HistoryPoint, IncidentSummary, LatestReading, SiteRow } from "./types";

export interface SiteData {
  site: SiteRow;
  latest: LatestReading[];
  history: HistoryPoint[];
  active: IncidentSummary[];
  assets: AssetRow[];
  devices: DeviceRow[];
}

const INCIDENT_FIELDS = "id, reference, title, severity, status, detected_at, evidence, assigned_to";

/**
 * Everything the dashboard shows for one site, kept current through Supabase Realtime
 * (new readings, incident changes and SMS), so no screen ever needs a manual refresh (PROJECT_RULES §6).
 */
export function useSiteData(siteId: string | undefined) {
  const [data, setData] = useState<SiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!siteId) return;
    const db = getSupabase()!;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const [site, latest, history, active, assets, devices] = await Promise.all([
      db.from("site_status").select("site_id, name, location, timezone, last_reading_at, active_incidents, status").eq("site_id", siteId).maybeSingle(),
      db.from("latest_readings").select("metric, value, unit, measured_at").eq("site_id", siteId),
      db.from("readings").select("metric, value, measured_at").eq("site_id", siteId)
        .in("metric", ["tank_level", "flow_rate"]).gte("measured_at", since).order("measured_at").limit(2000),
      db.from("incidents").select(INCIDENT_FIELDS).eq("site_id", siteId).neq("status", "closed").order("detected_at", { ascending: false }),
      db.from("assets").select("id, kind, name, details").eq("site_id", siteId).order("created_at"),
      db.from("device_health").select("id, name, connection, last_seen_at").eq("site_id", siteId),
    ]);
    const failed = [site, latest, history, active, assets, devices].find((r) => r.error);
    if (failed?.error || !site.data) {
      setError("Could not load the site. Check your connection and try again.");
      return;
    }
    setError(null);
    setData({
      site: site.data as SiteRow,
      latest: (latest.data ?? []) as LatestReading[],
      history: (history.data ?? []) as HistoryPoint[],
      active: (active.data ?? []) as IncidentSummary[],
      assets: (assets.data ?? []) as AssetRow[],
      devices: (devices.data ?? []) as DeviceRow[],
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
    for (const table of ["readings", "incidents", "sms_messages"]) {
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
