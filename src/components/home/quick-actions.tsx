"use client";

import { ChevronRight, ClipboardCheck, FileText, MessageSquareText, Zap, type LucideIcon } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";
import { cn } from "@/lib/cn";

interface Action {
  label: string;
  hint: string;
  icon: LucideIcon;
  onClick: () => void;
  tint: string;
  iconTint: string;
}

/** Things anyone may need at any moment. Every one opens a working dialog or panel. */
export function QuickActions({ canCheck }: { canCheck: boolean }) {
  const shell = useShell();
  const items: Action[] = [
    { label: "Report a problem", hint: "Log an issue or fault with your system", icon: FileText, onClick: shell.openReport,
      tint: "from-info-soft to-surface", iconTint: "bg-surface text-accent" },
    ...(canCheck
      ? [{ label: "Log routine check", hint: "Record today's walk-round of the system", icon: ClipboardCheck, onClick: shell.openRoutine,
          tint: "from-surface-muted to-surface", iconTint: "bg-surface text-accent" }]
      : []),
    { label: "Messages", hint: "View and reply to system messages", icon: MessageSquareText, onClick: shell.openMessages,
      tint: "from-ok-soft to-surface", iconTint: "bg-surface text-ok" },
  ];
  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
      <h2 className="flex items-center gap-2.5 text-lg font-bold">
        <Zap className="size-6 text-accent" aria-hidden />
        Quick actions
      </h2>
      <div className={cn("mt-3 grid gap-3", items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {items.map(({ label, hint, icon: Icon, onClick, tint, iconTint }) => (
          <button
            key={label}
            onClick={onClick}
            className={cn("card-wave flex min-h-[4.5rem] items-center gap-4 rounded-xl border border-line/60 bg-gradient-to-r px-4 py-3 text-left transition-shadow hover:shadow-card", tint)}
          >
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", iconTint)}>
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold text-ink">{label}</span>
              <span className="block text-sm text-ink-muted">{hint}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-accent" aria-hidden />
          </button>
        ))}
      </div>
    </section>
  );
}
