"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BatteryFull, Signal } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface Sms {
  id: string;
  direction: "outbound" | "inbound";
  body: string;
  status: string;
  created_at: string;
  phone_masked: string;
  is_simulated: boolean;
}

const RESULT_TEXT: Record<string, string> = {
  ok: "Reply accepted.",
  confirmation_requested: "Confirmation requested. Reply YES to close.",
  recovery_not_verified: "Not closed: flow has not been restored yet.",
  unknown_command: "Unknown reply. Use 1, 2, 3 or YES.",
  nothing_to_confirm: "Nothing waiting for confirmation.",
  no_incident_context: "No alert to reply to yet.",
  not_authorised: "Your role cannot do this by SMS.",
};

/** "Delivered" only when an SMS provider confirmed it; demonstration messages were sent, not confirmed. */
function smsStatus(m: Sms) {
  if (m.status === "failed") return "Failed";
  if (m.status === "delivered" && !m.is_simulated) return "Delivered";
  if (m.status === "queued") return "Queued";
  return "Sent";
}

/**
 * A basic feature phone showing the SMS thread for the signed-in user's number, exactly as sent. Replies use the
 * same handler as real SMS (sender verified, site checked, closing needs YES). SMS never controls a pump.
 */
export function Phone({ userId, locale, timezone }: { userId: string; locale: "en" | "sw"; timezone: string }) {
  const { notify } = useToast();
  const [messages, setMessages] = useState<Sms[]>([]);
  const [busy, setBusy] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const time = new Intl.DateTimeFormat("en-KE", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hour12: false });

  const load = useCallback(async () => {
    const { data } = await getSupabase()!
      .from("sms_messages")
      .select("id, direction, body, status, created_at, phone_masked, is_simulated")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(12);
    setMessages(((data ?? []) as Sms[]).reverse());
  }, [userId]);

  useEffect(() => {
    const db = getSupabase()!;
    const first = setTimeout(load, 0);
    const channel = db
      .channel(`sms-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sms_messages", filter: `profile_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => {
      clearTimeout(first);
      db.removeChannel(channel);
    };
  }, [userId, load]);

  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function reply(body: string) {
    setBusy(true);
    const { data, error } = await getSupabase()!.rpc("sms_simulate_reply", { p_body: body });
    setBusy(false);
    if (error) return notify("error", "SMS could not be sent. Check your connection.");
    load();
    const text = RESULT_TEXT[data?.result ?? data?.error] ?? "Reply processed.";
    notify(data?.ok || data?.result === "confirmation_requested" ? "success" : "error", text);
  }

  const number = messages.find((m) => m.direction === "outbound")?.phone_masked;
  const keys = ["1", "2", "3", locale === "sw" ? "NDIYO" : "YES"];

  return (
    <div className="mx-auto w-full max-w-[20rem]">
      <div className="rounded-[2.2rem] bg-as-dark p-3 shadow-card ring-1 ring-black/20">
        <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-white/15" />
        <div className="overflow-hidden rounded-xl bg-[#dfe8d8] text-[#18230f]">
          <div className="flex items-center justify-between bg-[#c9d6bf] px-3 py-1 text-[11px] font-semibold">
            <span className="flex items-center gap-1"><Signal className="size-3" aria-hidden />Safaricom</span>
            <span>SMS · AquaSentinel</span>
            <BatteryFull className="size-3.5" aria-hidden />
          </div>
          <div ref={screen} className="h-72 space-y-2 overflow-y-auto p-2.5 font-mono text-[12.5px] leading-snug" aria-live="polite" aria-label="SMS messages">
            {messages.length === 0 && <p className="pt-24 text-center text-[#4a5a3d]">No messages yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className={cn("max-w-[92%] rounded-md px-2 py-1.5", m.direction === "outbound" ? "bg-white/70" : "ml-auto bg-[#9fbf8a]/70 text-right")}>
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <p className="mt-0.5 text-[10px] text-[#4a5a3d]">
                  {time.format(new Date(m.created_at))}
                  {m.direction === "outbound" && ` · ${smsStatus(m)}`}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => reply(k)}
              disabled={busy}
              className="min-h-11 rounded-xl bg-white/10 text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              aria-label={`Reply ${k}`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-ink-muted">
        {number ? `SMS to ${number}. ` : ""}Works on any basic phone, no internet needed. Tap a key to reply.
      </p>
    </div>
  );
}
