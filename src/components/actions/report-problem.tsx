"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { key: "no_water", label: "No water at the taps" },
  { key: "leak", label: "Leak or burst pipe" },
  { key: "pump_stopped", label: "Pump not running" },
  { key: "storage", label: "Storage too low or overflowing" },
  { key: "solar", label: "Solar panel damaged or dirty" },
  { key: "other", label: "Something else" },
] as const;

const field = "mt-1 block w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base";

/** Anyone on the site can report what they see. It becomes a normal incident; repeats join the open one. */
export function ReportProblemDialog({ open, onClose, siteId }: { open: boolean; onClose: () => void; siteId: string }) {
  const router = useRouter();
  const { notify } = useToast();
  const [category, setCategory] = useState<string>("no_water");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { data, error } = await getSupabase()!.rpc("report_problem", { p_site: siteId, p_category: category, p_note: note });
    setBusy(false);
    if (error || !data?.ok) return notify("error", data?.error === "not_authorised" ? "You cannot report problems on this site." : "The report could not be sent. Try again.");
    notify("success", data.result === "created" ? `Reported as ${data.reference}. The team has been notified.` : `Added to the open report ${data.reference}.`);
    setNote("");
    onClose();
    router.push(`/incidents/${data.incident_id}`);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Report a problem" description="Tell the team what you see. They get an SMS straight away.">
      <fieldset>
        <legend className="text-sm font-medium">What is wrong?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => (
            <label
              key={c.key}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm",
                category === c.key ? "border-as-teal bg-info-soft font-medium" : "border-line",
              )}
            >
              <input type="radio" name="category" className="sr-only" checked={category === c.key} onChange={() => setCategory(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block text-sm font-medium">
        Details (optional)
        <textarea rows={3} className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Where is it, and since when?" maxLength={500} />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={busy} onClick={submit}>Send report</Button>
      </div>
    </Dialog>
  );
}
