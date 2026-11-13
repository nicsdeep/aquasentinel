"use client";

import { createContext, useContext } from "react";

/** Shell-level panels any screen can open (one Messages panel, one routine-check and report dialog). */
export interface ShellActions {
  openMessages: () => void;
  openReport: () => void;
  openRoutine: () => void;
}

export const ShellContext = createContext<ShellActions | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside the app shell");
  return ctx;
}
