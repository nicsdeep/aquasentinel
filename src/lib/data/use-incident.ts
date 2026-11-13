"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { Evidence, IncidentStatus, Outcome, Severity } from "./types";

export interface IncidentDetail {
  id: string;
  reference: string;
  site_id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  evidence: Evidence;
  detected_at: string;
  acknowledged_at: string | null;
  assigned_to: string | null;
  assigned_at: string | null;
  diagnosis: string | null;
  diagnosis_status: "suspected" | "confirmed" | null;
  action_taken: string | null;
  repair_cost_kes: number | null;
  recovered_at: string | null;
  recovery_method: "telemetry" | "manual" | null;
  closed_at: string | null;
  close_reason: string | null;
  outcome: Outcome | null;
  rule: { name: string; explanation: string; problem_reference: string; sustain_minutes: number } | null;
  assignee: { full_name: string } | null;
  site: { name: string; timezone: string } | null;
}

export interface TimelineEntry {
  id: number;
  occurred_at: string;
  action: string;
  channel: "web" | "sms" | "system" | "device";
  details: Record<string, unknown>;
  actor_name: string | null;
}

export interface Technician {
  user_id: string;
  full_name: string;
}

const FIELDS = `id, reference, site_id, title, severity, status, evidence, detected_at, acknowledged_at, assigned_to, assigned_at,
  diagnosis, diagnosis_status, action_taken, repair_cost_kes, recovered_at, recovery_method, closed_at, close_reason, outcome,
  rule:alert_rules(name, explanation, problem_reference, sustain_minutes),
  assignee:profiles!incidents_assigned_to_fkey(full_name),
  site:sites(name, timezone)`;

/** One incident with its full history, kept current through Realtime (web and SMS actions show up instantly). */
export function useIncident(id: string) {
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    const db = getSupabase()!;
    const { data } = await db.from("incidents").select(FIELDS).eq("id", id).maybeSingle();
    if (!data) {
      setMissing(true);
      return;
    }
    const detail = data as unknown as IncidentDetail;
    const [events, techs] = await Promise.all([
      db.from("incident_timeline").select("id, occurred_at, action, channel, details, actor_name").eq("incident_id", id).order("occurred_at"),
      db.from("site_members").select("user_id, profiles(full_name)").eq("site_id", detail.site_id).eq("role", "technician"),
    ]);
    setIncident(detail);
    setTimeline((events.data ?? []) as TimelineEntry[]);
    setTechnicians(
      ((techs.data ?? []) as unknown as { user_id: string; profiles: { full_name: string } | null }[]).map((t) => ({
        user_id: t.user_id,
        full_name: t.profiles?.full_name ?? "Technician",
      })),
    );
  }, [id]);

  useEffect(() => {
    const db = getSupabase()!;
    const first = setTimeout(load, 0);
    const channel = db
      .channel(`incident-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents", filter: `id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_log", filter: `entity_id=eq.${id}` }, () => load())
      .subscribe();
    return () => {
      clearTimeout(first);
      db.removeChannel(channel);
    };
  }, [id, load]);

  return { incident, timeline, technicians, missing, reload: load };
}
