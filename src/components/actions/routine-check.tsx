"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const ITEMS = [
  "Intake screen is clear",
  "No leaks along the pipeline",
  "Storage level looks normal",
  "Solar panels are clean and undamaged",
];

/** Daily walk-round in four taps. Anything not OK is recorded for follow-up. */
export function RoutineCheckDialog({ open, onClose, siteId, onDone }: { open: boolean; onClose: () => void; siteId: string; onDone: () => void }) {
  const { notify } = useToast();
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => Object.fromEntries(ITEMS.map((i) => [i, true])));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const issues = ITEMS.filter((i) => !answers[i]).length;

  async function submit() {
    setBusy(true);
    const { data, error } = await getSupabase()!.rpc("log_routine_check", {
      p_site: siteId,
      p_items: ITEMS.map((item) => ({ item, ok: answers[item] })),
      p_note: note,
    });
    setBusy(false);
    if (error || data !== "ok") return notify("error", data === "not_authorised" ? "Your role does not do routine checks." : "The check could not be saved. Try again.");
    notify("success", issues ? `Routine check saved with ${issues} item${issues > 1 ? "s" : ""} to follow up.` : "Routine check saved. All good.");
    setNote("");
    onDone();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Today's routine check" description="Walk the system and mark anything that is not OK.">
      <ul className="space-y-2">
        {ITEMS.map((item) => (
          <li key={item} className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-2">
            <span className="text-sm">{item}</span>
            <div className="flex gap-1" role="group" aria-label={item}>
              {[true, false].map((ok) => (
                <button
                  key={String(ok)}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [item]: ok }))}
                  aria-pressed={answers[item] === ok}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-medium",
                    answers[item] === ok ? (ok ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn") : "text-ink-muted hover:bg-surface-muted",
                  )}
                >
                  {ok ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                  {ok ? "OK" : "Not OK"}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <label className="mt-4 block text-sm font-medium">
        Notes (optional)
        <textarea rows={2} className="mt-1 block w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-base" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      </label>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" loading={busy} onClick={submit}>Save check</Button>
      </div>
    </Dialog>
  );
}
