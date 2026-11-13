"use client";

import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";
import type { Task } from "@/lib/tasks";
import { TONE_CLASSES } from "@/lib/status";
import { cn } from "@/lib/cn";

const DOT: Record<string, string> = { crit: "bg-crit", warn: "bg-warn", info: "bg-as-teal", ok: "bg-ok", off: "bg-off" };

/** One task: a clear title, why it matters, and a single tap to do it. */
export function TaskRow({ task, primary = false }: { task: Task; primary?: boolean }) {
  const shell = useShell();
  const body = (
    <>
      <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", DOT[task.tone])} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{task.title}</span>
        <span className="block text-xs text-ink-muted">{task.detail}</span>
      </span>
      {"action" in task.target ? (
        <span
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium",
            primary ? "bg-as-orange text-white" : cn("border border-line", TONE_CLASSES.info),
          )}
        >
          <ClipboardCheck className="size-4" aria-hidden />
          Start
        </span>
      ) : (
        <ChevronRight className="mt-1 size-4 shrink-0 text-ink-subtle" aria-hidden />
      )}
    </>
  );
  const cls = "flex min-h-14 w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-muted";
  return "action" in task.target ? (
    <button type="button" onClick={shell.openRoutine} className={cls}>
      {body}
    </button>
  ) : (
    <Link href={task.target.href} className={cls}>
      {body}
    </Link>
  );
}
