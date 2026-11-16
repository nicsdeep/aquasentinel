"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SITE_NAV, SITE_SECONDARY } from "@/lib/site/content";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";

/** Signed-in visitors keep their role-based experience: offer their dashboard instead of Sign In. */
function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    getSupabase()?.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return signedIn;
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Shared public header (homepage, content pages and policy pages for visitors).
 * Laptop: logo, four destinations, Sign In. Phone: logo and a menu button that opens a native modal drawer
 * (focus is trapped and returned, Escape closes it, it closes itself after navigation).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const signedIn = useSignedIn();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const cta = signedIn ? { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard } : { href: "/sign-in", label: "Sign In", icon: LogIn };

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Close the drawer whenever the page changes (including browser back / forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  return (
    <header className="relative z-30 bg-white/95 backdrop-blur">
      <div className={cn(siteContainer, "flex h-[72px] items-center gap-6 md:h-[82px]")}>
        <Link href="/" aria-label="AquaSentinel home" className="shrink-0">
          <Logo height={70} className="hidden md:block" />
          <Logo height={42} className="md:hidden" />
        </Link>
        <nav className="ml-auto hidden items-center gap-12 lg:flex" aria-label="Main">
          {SITE_NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-[18px] text-lp-ink transition-colors hover:text-lp-blue",
                  (active || n.href === "/pilot") && "font-semibold",
                  active && "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-lp-cyan",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <Link href={cta.href} className="ml-auto hidden h-12 items-center rounded-xl bg-lp-blue-deep px-6 text-[17px] font-medium text-white shadow-sm transition hover:brightness-110 md:inline-flex lg:ml-6">
          {cta.label}
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="-mr-2 ml-auto grid size-12 place-items-center rounded-xl text-lp-ink md:ml-0 lg:hidden"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Open menu"
        >
          <Menu className="size-8" strokeWidth={2.2} aria-hidden />
        </button>
      </div>

      <dialog
        id="site-menu"
        ref={dialog}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none bg-white p-0 text-lp-ink shadow-2xl backdrop:bg-lp-ink/45 backdrop:backdrop-blur-[2px] open:flex open:flex-col"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#e3edf2] px-5">
          <Logo height={34} />
          <button onClick={() => setOpen(false)} className="grid size-12 place-items-center rounded-xl hover:bg-lp-band" aria-label="Close menu" autoFocus>
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Site">
          <ul className="space-y-1">
            {[{ href: "/", label: "Home", icon: null }, ...SITE_NAV, ...SITE_SECONDARY].map((n) => {
              const active = n.href === "/" ? pathname === "/" : isActive(pathname, n.href);
              const Icon = n.icon;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[52px] items-center gap-4 rounded-xl px-4 text-[17px] transition-colors",
                      active ? "bg-lp-pill font-semibold text-lp-ink" : "text-lp-ink hover:bg-lp-band",
                    )}
                  >
                    {Icon ? <Icon className={cn("size-5", active ? "text-lp-blue" : "text-lp-cyan")} strokeWidth={1.8} aria-hidden /> : <span className="size-5" aria-hidden />}
                    <span className="flex-1">{n.label}</span>
                    <ChevronRight className="size-4 text-lp-body/50" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-[#e3edf2] p-5">
          <Link href={cta.href} onClick={() => setOpen(false)} className="flex h-[52px] items-center justify-center gap-3 rounded-full bg-lp-blue-deep text-[17px] font-medium text-white">
            {cta.label} <ArrowRight className="size-5" aria-hidden />
          </Link>
          <Link href="/legal" onClick={() => setOpen(false)} className="mt-4 block text-center text-[14px] text-lp-body hover:text-lp-ink">
            Privacy, terms and security
          </Link>
        </div>
      </dialog>
    </header>
  );
}
