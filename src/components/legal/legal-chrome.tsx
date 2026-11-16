"use client";

import { SiteShell } from "@/components/public/site-shell";

/**
 * Public layout for visitors (not signed in) on trust & legal pages: the same shared site header (with mobile
 * drawer) and footer as the rest of the public website. Signed-in users see the page inside the app shell instead.
 */
export function LegalChrome({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-6xl px-5 pt-6 md:px-8 md:pt-8">{children}</div>
    </SiteShell>
  );
}
