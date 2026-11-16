"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, LayoutDashboard, Menu, UserRound, X } from "lucide-react";
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
  const cta = signedIn ? { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard } : { href: "/sign-in", label: "Sign In", icon: UserRound };

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
        className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[min(23rem,90vw)] max-w-none overflow-hidden rounded-l-[28px] bg-white p-0 text-lp-ink shadow-2xl backdrop:bg-lp-ink/45 open:flex open:flex-col"
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-5 pt-7">
          <Logo height={40} />
          <button onClick={() => setOpen(false)} className="-mr-2 grid size-12 place-items-center rounded-xl hover:bg-lp-band" aria-label="Close menu" autoFocus>
            <X className="size-7" strokeWidth={2} aria-hidden />
          </button>
        </div>
        <nav className="px-6" aria-label="Site">
          <ul className="border-t border-[#e3edf2]">
            {[...SITE_NAV, ...SITE_SECONDARY].map((n) => {
              const active = isActive(pathname, n.href);
              const Icon = n.icon;
              return (
                <li key={n.href} className="border-b border-[#e3edf2]">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-[64px] items-center gap-5 text-[18px] transition-colors", active ? "font-semibold text-lp-blue" : "text-lp-ink hover:text-lp-blue")}
                  >
                    <Icon className="size-7 shrink-0 text-lp-cyan" strokeWidth={1.6} aria-hidden />
                    <span className="flex-1">{n.label}</span>
                    <ChevronRight className="size-5 text-lp-body/60" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href={cta.href} onClick={() => setOpen(false)} className="mt-8 flex h-14 items-center justify-center gap-3 rounded-2xl bg-lp-blue-deep text-[18px] font-medium text-white shadow-sm transition hover:brightness-110">
            <cta.icon className="size-5" aria-hidden /> {cta.label}
          </Link>
        </nav>
        <svg className="mt-auto h-40 w-full shrink-0" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden>
          <path d="M0 70C90 40 170 50 250 72s110 18 150-12v100H0Z" fill="#bfe8f5" opacity="0.8" />
          <path d="M0 104C80 80 160 88 240 106s120 14 160-14v68H0Z" fill="#5fd0ea" opacity="0.7" />
          <path d="M0 132C90 112 180 120 260 134s100 8 140-8v34H0Z" fill="#7fdaf0" />
        </svg>
      </dialog>
    </header>
  );
}
