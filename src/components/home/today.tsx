"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, CircleCheck, Square } from "lucide-react";
import { useShell } from "@/components/shell/shell-context";
import type { Task } from "@/lib/tasks";

/** Today's top tasks. Each row opens the place where the task is done (incident page or routine check). */
export function Today({ tasks }: { tasks: Task[] }) {
  const shell = useShell();
  return (
    <section className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold">
          <CalendarDays className="size-6 text-accent" aria-hidden />
          Today
        </h2>
        <Link href="/tasks" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline">
          All tasks <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 pt-1 text-sm text-ink-muted">
          <CircleCheck className="size-4 text-ok" aria-hidden />
          Nothing needs doing right now.
        </p>
      ) : (
        <ul className="space-y-2 px-4 pb-4 pt-1">
          {tasks.slice(0, 3).map((t) => {
            const cls = "flex min-h-16 w-full items-start gap-3 rounded-xl bg-surface-muted px-4 py-3 text-left transition-colors hover:bg-info-soft";
            const body = (
              <>
                <Square className="mt-0.5 size-5 shrink-0 text-ink-subtle" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-ink">{t.title}</span>
                  <span className="block text-sm text-ink-muted">{t.detail}</span>
                </span>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden />
              </>
            );
            return (
              <li key={t.id}>
                {"action" in t.target ? (
                  <button type="button" onClick={shell.openRoutine} className={cls}>{body}</button>
                ) : (
                  <Link href={t.target.href} className={cls}>{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
