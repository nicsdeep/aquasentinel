"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

/** Site switcher. Members currently belong to one site; the menu shows it and opens its details. */
export function SiteMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative hidden shrink-0 md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
      >
        <span className="max-w-72 truncate">{name}</span>
        <span className="size-1.5 rounded-full bg-ok" aria-hidden />
        <ChevronDown className={cn("size-4 text-ink-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-card">
          <p className="px-3 pb-1 pt-2 text-xs font-medium text-ink-muted">Your water systems</p>
          <div role="menuitemradio" aria-checked="true" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium">
            <MapPin className="size-4 text-accent" aria-hidden />
            <span className="flex-1">{name}</span>
            <Check className="size-4 text-accent" aria-hidden />
          </div>
          <Link role="menuitem" href="/site" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-accent hover:bg-surface-muted">
            Open site details
            <ChevronRight className="ml-auto size-4" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
