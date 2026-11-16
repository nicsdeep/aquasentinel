import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * The one public layout: shared header (with mobile drawer) and footer around the page.
 * Used by the (site) route group and, for visitors, by the trust & legal pages (LegalChrome).
 * The page fills the screen so the footer always ends it, with no white band below.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-lp-ink">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
