"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// In-memory count of client-side page changes in this tab. It resets on a full page load, so a page opened
// directly (or from another site) never sends "Back" outside AquaSentinel.
let inAppNavigations = 0;

/** Mounted once in the root layout: counts page changes made inside the app. */
export function NavigationTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    inAppNavigations += 1;
  }, [pathname]);
  return null;
}

/** True when the previous history entry is one of our own pages. */
export function canGoBackInApp(): boolean {
  if (inAppNavigations > 0) return true;
  try {
    return !!document.referrer && new URL(document.referrer).origin === window.location.origin && window.history.length > 1;
  } catch {
    return false;
  }
}
