"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Side panel on laptops, full-height panel on phones. Native <dialog>: focus trap, Escape, backdrop. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md bg-canvas p-0 text-ink shadow-card backdrop:bg-as-dark/50 sm:rounded-l-3xl"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-surface-muted" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </dialog>
  );
}
