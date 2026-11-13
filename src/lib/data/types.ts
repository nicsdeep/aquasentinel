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
}
