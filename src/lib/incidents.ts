import type { Tone } from "@/lib/status";
import type { Evidence, IncidentStatus, Outcome, Severity } from "@/lib/data/types";

export const STATUS_LABEL: Record<IncidentStatus, string> = {
  open: "New",
  acknowledged: "Acknowledged",
  assigned: "Technician assigned",
  recovered: "Recovery verified",
  closed: "Closed",
};

export const STATUS_TONE: Record<IncidentStatus, Tone> = {
  open: "crit",
  acknowledged: "warn",
  assigned: "info",
  recovered: "ok",
  closed: "off",
};

export const SEVERITY: Record<Severity, { label: string; tone: Tone }> = {
  needs_attention: { label: "Needs attention", tone: "crit" },
  warning: { label: "Warning", tone: "warn" },
};

export const OUTCOME_LABEL: Record<Outcome, string> = {
  fault_repaired: "Fault repaired",
  false_alarm: "False alarm",
  no_action_needed: "No action needed",
};

/** The 8-step loop from PROJECT_RULES §7, as shown on the incident page. */
export const LIFECYCLE: { status: IncidentStatus; label: string }[] = [
  { status: "open", label: "Detected" },
  { status: "acknowledged", label: "Acknowledged" },
  { status: "assigned", label: "Assigned" },
  { status: "recovered", label: "Recovered" },
  { status: "closed", label: "Closed" },
];

export function timelineLabel(action: string, details: Record<string, unknown>): string {
  switch (action) {
    case "detected": return "Fault detected by rule";
    case "notified": return "Alert sent to dashboard and SMS";
    case "acknowledged": return "Acknowledged";
    case "assigned": return `Assigned to ${String(details.technician ?? "technician")}`;
    case "work_recorded": return `Work recorded: ${String(details.diagnosis ?? "")}`;
    case "recovery_verified":
      return details.method === "manual" ? "Recovery verified by technician" : "Recovery verified from readings";
    case "close_requested": return "Closure requested by SMS (awaiting YES)";
    case "closed": return `Closed: ${OUTCOME_LABEL[details.outcome as Outcome] ?? "closed"}`;
    default: return action.replaceAll("_", " ");
  }
}

/** Database result codes → plain language (shown in toasts). */
export function resultMessage(code: string): string {
  const map: Record<string, string> = {
    ok: "Done.",
    not_found: "This incident no longer exists.",
    not_authorised: "Your role cannot do this.",
    not_a_technician: "Choose a technician.",
    not_assigned_to_you: "Only the assigned technician can record this work.",
    recovery_not_verified: "Recovery must be verified first: flow restored in the readings, or a technician's check.",
    reason_required: "Please give a reason.",
    diagnosis_required: "Please describe what was found.",
    note_required: "Please describe how recovery was checked.",
    invalid_cost: "Cost cannot be negative.",
    already_closed: "This incident is already closed.",
  };
  if (code.startsWith("already_")) return map[code] ?? `Already ${code.replace("already_", "").replaceAll("_", " ")}.`;
  return map[code] ?? `Could not complete the action (${code}).`;
}

/** Plain-language evidence ("Pump running but no flow: 0.1 m³/h for 10 min."). Mirrors the SMS wording. */
export function evidenceText(e: Evidence): string {
  const v = e.value != null ? `${e.value} ${e.unit ?? ""}`.trim() : "";
  switch (e.kind) {
    case "pump_on_no_flow": return `Pump running but no flow: ${v} for ${e.minutes} min.`;
    case "pump_on_low_flow": return `Pump running with reduced flow: ${v} for ${e.minutes} min.`;
    case "below": return `Below the safe level: ${v} for ${e.minutes} min.`;
    case "below_in_daylight": return `Low solar output in daylight: ${v} for ${e.minutes} min.`;
    case "no_data": return `No data from the monitoring unit for ${e.minutes} min.`;
    default: return "";
  }
}
