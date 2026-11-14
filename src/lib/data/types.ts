import type { SiteStatus } from "@/lib/status";

export type Metric = "pump_running" | "flow_rate" | "tank_level" | "battery_voltage" | "solar_power";
export type IncidentStatus = "open" | "acknowledged" | "assigned" | "recovered" | "closed";
export type Severity = "warning" | "needs_attention";
export type Outcome = "fault_repaired" | "false_alarm" | "no_action_needed";

export interface SiteRow {
  site_id: string;
  name: string;
  location: string;
  timezone: string;
  last_reading_at: string | null;
  active_incidents: number;
  status: SiteStatus;
}

export interface LatestReading {
  metric: Metric;
  value: number;
  unit: string;
  measured_at: string;
}

export interface HistoryPoint {
  metric: Metric;
  value: number;
  measured_at: string;
}

export interface IncidentSummary {
  id: string;
  reference: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  detected_at: string;
  evidence: Evidence;
  assigned_to: string | null;
  assigned_at: string | null;
  diagnosis: string | null;
}

export interface Evidence {
  kind?: string;
  value?: number;
  unit?: string;
  minutes?: number;
  threshold?: number;
  suspected_cause?: string;
  recommended_action?: string;
  rule_explanation?: string;
  last_seen_at?: string | null;
  reported_by?: string;
  note?: string | null;
  category?: string;
}

export interface AssetRow {
  id: string;
  kind: string;
  name: string;
  details: { note?: string; rated_kw?: number; power?: string };
}

export interface DeviceRow {
  id: string;
  name: string;
  connection: "online" | "offline" | "revoked";
  last_seen_at: string | null;
  is_simulated: boolean;
}

export interface Member {
  user_id: string;
  role: "operator" | "technician" | "committee" | "admin";
  full_name: string;
}

export interface RoutineCheck {
  occurred_at: string;
  actor_name: string | null;
  issues: number;
}

/** One line in Home's "Recent activity": an incident timeline entry with its incident's title. */
export interface RecentEvent {
  id: number | string;
  incident_id: string;
  occurred_at: string;
  action: string;
  details: Record<string, unknown>;
  actor_name: string | null;
  title: string;
  reference: string;
}
