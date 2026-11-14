"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { IncidentSummary, RecentEvent } from "@/lib/data/types";
import { STATUS_LABEL } from "@/lib/incidents";
import { cn } from "@/lib/cn";

interface Result {
  key: string;
  label: string;
  hint: string;
  run: () => void;
}

/**
 * Search across what this person can see: open alerts, recent incidents, screens and actions.
 * Every result opens a real screen or dialog. Data comes from the shared site data (RLS applies).
 */
export function SearchBox({
  incidents,
  recent,
  canCheck,
  onReport,
  onRoutine,
  onMessages,
}: {
  incidents: IncidentSummary[];
  recent: RecentEvent[];
  canCheck: boolean;
  onReport: () => void;
  onRoutine: () => void;
  onMessages: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  const all = useMemo<Result[]>(() => {
    const go = (href: string) => () => router.push(href);
    const seen = new Set<string>();
    const items: Result[] = [];
    for (const i of incidents) {
      seen.add(i.id);
      items.push({ key: i.id, label: i.title, hint: `${i.reference} · ${STATUS_LABEL[i.status]}`, run: go(`/incidents/${i.id}`) });
    }
    for (const e of recent) {
      if (seen.has(e.incident_id)) continue;
      seen.add(e.incident_id);
      items.push({ key: e.incident_id, label: e.title, hint: `${e.reference} · recent incident`, run: go(`/incidents/${e.incident_id}`) });
    }
    items.push(
      { key: "p-home", label: "Home", hint: "Screen", run: go("/dashboard") },
      { key: "p-site", label: "Site details", hint: "Screen · readings, chart, equipment", run: go("/site") },
      { key: "p-open", label: "Open alerts", hint: "Screen · Alerts & incidents", run: go("/incidents") },
      { key: "p-closed", label: "Closed incidents", hint: "Screen · maintenance history", run: go("/incidents?tab=closed") },
      { key: "p-tasks", label: "Tasks", hint: "Screen", run: go("/tasks") },
      { key: "p-brief", label: "How it meets the brief", hint: "Screen", run: go("/brief") },
      { key: "a-report", label: "Report a problem", hint: "Action", run: onReport },
      { key: "a-msg", label: "Messages", hint: "Action · SMS alerts and replies", run: onMessages },
    );
    if (canCheck) items.push({ key: "a-check", label: "Log routine check", hint: "Action", run: onRoutine });
    return items;
  }, [incidents, recent, canCheck, onReport, onRoutine, onMessages, router]);

  const term = q.trim().toLowerCase();
  const results = term ? all.filter((r) => `${r.label} ${r.hint}`.toLowerCase().includes(term)).slice(0, 8) : [];
  const active = Math.min(cursor, Math.max(results.length - 1, 0));

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function pick(r: Result) {
    setOpen(false);
    setQ("");
    r.run();
  }

  return (
    <div ref={ref} className="relative hidden max-w-xl flex-1 md:block">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-subtle" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setCursor(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
          if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search alerts, incidents, tasks or screens…"
        aria-label="Search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        className="h-11 w-full rounded-xl border border-line bg-surface-soft pl-10 pr-3 text-sm outline-none placeholder:text-ink-subtle focus:border-accent"
      />
      {open && term && (
        <div id={listId} role="listbox" className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">Nothing matches “{q.trim()}”.</p>
          ) : (
            results.map((r, i) => (
              <button
                key={r.key}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(r)}
                className={cn("block w-full border-b border-line/60 px-4 py-2.5 text-left last:border-0", i === active && "bg-info-soft")}
              >
                <span className="block text-sm font-medium text-ink">{r.label}</span>
                <span className="block text-xs text-ink-muted">{r.hint}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
