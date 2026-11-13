"use client";

import { ClipboardCheck, Megaphone, MessageSquare } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";

/** Three things anyone may need at any moment. All open working dialogs; none are links to nowhere. */
export function QuickActions({ canCheck }: { canCheck: boolean }) {
  const shell = useShell();
  const items = [
    { label: "Report a problem", icon: Megaphone, onClick: shell.openReport, show: true },
    { label: "Log routine check", icon: ClipboardCheck, onClick: shell.openRoutine, show: canCheck },
    { label: "Messages", icon: MessageSquare, onClick: shell.openMessages, show: true },
  ].filter((i) => i.show);
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 className="text-base font-semibold">Quick actions</h2>
      <div className={`mt-3 grid gap-2 ${items.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl bg-surface-muted px-2 text-center text-sm font-medium text-ink transition-colors hover:bg-info-soft"
          >
            <Icon className="size-5 text-accent" aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
