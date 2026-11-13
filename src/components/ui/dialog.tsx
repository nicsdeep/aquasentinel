"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal built on the native <dialog> element (focus trap, Escape to close, backdrop).
 * Used for every consequential confirmation (PROJECT_RULES §6).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
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
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-as-dark/60"
      aria-labelledby="dialog-title"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
          </div>
          <button onClick={onClose} className="-m-2 rounded-lg p-2 text-ink-muted hover:bg-surface-muted" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
