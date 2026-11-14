"use client";

import { useState } from "react";
import { CircleCheck, ClipboardList, HandHelping, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/lib/auth/session";
import type { IncidentDetail, Technician } from "@/lib/data/use-incident";
import type { Outcome } from "@/lib/data/types";
import { OUTCOME_LABEL, resultMessage } from "@/lib/incidents";
import { getSupabase } from "@/lib/supabase/client";

type Modal = "assign" | "work" | "verify" | "close" | null;

const field = "mt-1 block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base";

/**
 * The actions this person may take now, by role and incident state. The database enforces the same rules,
 * so a hidden button is a convenience, not the security boundary.
 */
export function IncidentActions({
  incident,
  role,
  userId,
  technicians,
  onDone,
}: {
  incident: IncidentDetail;
  role: Role;
  userId: string;
  technicians: Technician[];
  onDone: () => void;
}) {
  const { notify } = useToast();
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [technician, setTechnician] = useState(technicians[0]?.user_id ?? "");
  const [diagnosis, setDiagnosis] = useState(incident.diagnosis ?? "");
  const [diagnosisStatus, setDiagnosisStatus] = useState<"suspected" | "confirmed">(incident.diagnosis_status ?? "suspected");
  const [action, setAction] = useState(incident.action_taken ?? "");
  const [cost, setCost] = useState(incident.repair_cost_kes?.toString() ?? "");
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("false_alarm");
  const [reason, setReason] = useState("");

  const s = incident.status;

  // Defaults are chosen when a dialog opens, from the incident as it is now (it may have changed since the page loaded).
  function openClose() {
    setOutcome(s === "recovered" ? "fault_repaired" : "false_alarm");
    setReason("");
    setModal("close");
  }
  function openWork() {
    setDiagnosis(incident.diagnosis ?? "");
    setDiagnosisStatus(incident.diagnosis_status ?? "suspected");
    setAction(incident.action_taken ?? "");
    setCost(incident.repair_cost_kes?.toString() ?? "");
    setModal("work");
  }
  const manager = role === "operator" || role === "committee" || role === "admin";
  const active = s === "open" || s === "acknowledged" || s === "assigned";
  const mine = incident.assigned_to === userId;

  // Exactly one orange (primary) action: the next step for this role at this stage.
  const next =
    s === "open" ? "ack"
    : s === "acknowledged" ? (manager ? "assign" : role === "technician" ? "take" : null)
    : s === "assigned" ? ((role === "technician" && mine) || role === "admin" ? (incident.diagnosis ? "verify" : "work") : null)
    : s === "recovered" && manager ? "close"
    : null;
  const v = (key: string) => (next === key ? "primary" : "secondary") as "primary" | "secondary";

  async function call(fn: string, args: Record<string, unknown>, success: string) {
    setBusy(true);
    const { data, error } = await getSupabase()!.rpc(fn, args);
    setBusy(false);
    if (error) return notify("error", "Could not reach the server. Check your connection and try again.");
    if (data !== "ok") return notify("error", resultMessage(String(data)));
    notify("success", success);
    setModal(null);
    onDone();
  }

  if (s === "closed") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {s === "open" && (
        <Button variant={v("ack")} onClick={() => call("incident_acknowledge", { p_incident: incident.id }, `${incident.reference} acknowledged.`)} loading={busy}>
          <CircleCheck className="size-4" aria-hidden />
          Acknowledge
        </Button>
      )}
      {active && manager && technicians.length > 0 && (
        <Button variant={v("assign")} onClick={() => setModal("assign")} disabled={busy}>
          <UserRound className="size-4" aria-hidden />
          {incident.assigned_to ? "Reassign technician" : "Assign technician"}
        </Button>
      )}
      {active && role === "technician" && !mine && (
        <Button variant={v("take")} onClick={() => call("incident_assign", { p_incident: incident.id, p_technician: userId }, "You have taken this job.")} loading={busy}>
          <HandHelping className="size-4" aria-hidden />
          Take this job
        </Button>
      )}
      {((role === "technician" && mine) || role === "admin") && (
        <Button variant={v("work")} onClick={openWork} disabled={busy}>
          <ClipboardList className="size-4" aria-hidden />
          {incident.diagnosis ? "Update work record" : "Record findings and repair"}
        </Button>
      )}
      {active && (role === "technician" || role === "admin") && (
        <Button variant={v("verify")} onClick={() => setModal("verify")} disabled={busy}>
          <ShieldCheck className="size-4" aria-hidden />
          Confirm water is flowing
        </Button>
      )}
      {manager && (
        <Button variant={s === "recovered" ? v("close") : "ghost"} onClick={openClose} disabled={busy}>
          {s === "recovered" ? "Close incident" : "Close as false alarm"}
        </Button>
      )}

      <Dialog open={modal === "assign"} onClose={() => setModal(null)} title="Assign a technician" description="They receive an SMS with the incident details.">
        <label className="block text-sm font-medium">
          Technician
          <select className={field} value={technician} onChange={(e) => setTechnician(e.target.value)}>
            {technicians.map((t) => (
              <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
            ))}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={() => call("incident_assign", { p_incident: incident.id, p_technician: technician }, "Technician assigned and notified by SMS.")}>
            Assign
          </Button>
        </div>
      </Dialog>

      <Dialog open={modal === "work"} onClose={() => setModal(null)} title="Findings and repair" description="Say what you found. Mark it confirmed only after inspecting it yourself.">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            call("incident_record_work", {
              p_incident: incident.id,
              p_diagnosis: diagnosis,
              p_diagnosis_status: diagnosisStatus,
              p_action_taken: action,
              p_repair_cost_kes: cost === "" ? null : Number(cost),
            }, "Work record saved.");
          }}
        >
          <label className="block text-sm font-medium">
            What was found
            <textarea required rows={2} className={field} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Intake screen blocked with sediment" />
          </label>
          <fieldset className="text-sm">
            <legend className="font-medium">Is the cause confirmed?</legend>
            <div className="mt-1 flex gap-2">
              {(["suspected", "confirmed"] as const).map((v) => (
                <label key={v} className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 has-[:checked]:border-as-teal has-[:checked]:bg-info-soft">
                  <input type="radio" name="diagnosis-status" checked={diagnosisStatus === v} onChange={() => setDiagnosisStatus(v)} />
                  {v === "suspected" ? "Suspected" : "Confirmed by inspection"}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">
            Repair done (optional)
            <textarea rows={2} className={field} value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. Cleaned the intake screen" />
          </label>
          <label className="block text-sm font-medium">
            Parts and labour cost, KES (optional)
            <input type="number" min={0} step="1" inputMode="numeric" className={field} value={cost} onChange={(e) => setCost(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={busy}>Save</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={modal === "verify"} onClose={() => setModal(null)} title="Confirm water is flowing" description="Use this when you checked on site that water flows again. Normally the readings confirm recovery automatically.">
        <label className="block text-sm font-medium">
          How did you check?
          <textarea rows={2} className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Flow seen at the storage inlet after cleaning" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={() => call("incident_verify_recovery", { p_incident: incident.id, p_note: note }, "Recovery confirmed.")}>
            Confirm recovery
          </Button>
        </div>
      </Dialog>

      <Dialog open={modal === "close"} onClose={() => setModal(null)} title={`Close ${incident.reference}`} description="Closing keeps the full record for reports and learning.">
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Outcome
            <select className={field} value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)}>
              {(Object.keys(OUTCOME_LABEL) as Outcome[])
                .filter((o) => o !== "fault_repaired" || s === "recovered")
                .map((o) => (
                  <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>
                ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Reason
            <textarea required rows={2} className={field} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Intake cleaned, flow back to 12 m³/h" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" loading={busy} onClick={() => call("incident_close", { p_incident: incident.id, p_outcome: outcome, p_reason: reason }, `${incident.reference} closed.`)}>
            Close incident
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
