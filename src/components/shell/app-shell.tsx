"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FlaskConical, LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ROLE_LABEL, useSession, type Membership } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./nav";

function initials(name: string) {
  return name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function NavLinks({ onNavigate, variant }: { onNavigate?: () => void; variant: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              variant === "sidebar"
                ? "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors"
                : "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
              variant === "sidebar" && (active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"),
              variant === "bottom" && (active ? "text-navy-800 dark:text-sky-500" : "text-ink-muted"),
            )}
          >
            <Icon className={variant === "sidebar" ? "size-5" : "size-6"} aria-hidden />
            {label}
          </Link>
        );
      })}
    </>
  );
}

function UserCard({ name, membership, onSignOut }: { name: string; membership?: Membership; onSignOut: () => void }) {
  return (
    <div className="rounded-xl bg-white/8 p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-600 text-sm font-bold text-white">
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          {membership && <p className="truncate text-xs text-white/70">{ROLE_LABEL[membership.role]}</p>}
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white/85 hover:bg-white/10"
      >
        <LogOut className="size-4" aria-hidden />
        Sign out
      </button>
    </div>
  );
}

/**
 * Responsive app frame: navy sidebar on laptops; header with a working hamburger menu plus a bottom
 * navigation bar on phones (PROJECT_RULES §6). Shows a SIMULATED banner whenever demo data is on screen.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session.status === "signed_out") router.replace("/");
  }, [session.status, router]);

  if (session.status !== "signed_in") {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-ink-muted">
        {session.status === "unconfigured" ? (
          <p>The app is not connected to its database yet.</p>
        ) : (
          <LoaderCircle className="size-6 animate-spin" aria-label="Loading" />
        )}
      </div>
    );
  }

  const name = session.profile?.fullName ?? session.user.email ?? "User";
  const membership = session.memberships[0];
  const simulated = session.memberships.some((m) => m.isSimulated);
  const signOut = async () => {
    await session.signOut();
    router.replace("/");
  };

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16.5rem_1fr]">
      {/* Laptop / desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 bg-navy-900 p-4 md:flex">
        <Link href="/dashboard" className="px-2 pt-1">
          <Logo inverted />
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Main">
          <NavLinks variant="sidebar" />
        </nav>
        <div className="mt-auto space-y-3">
          <p className="px-2 text-xs leading-relaxed text-white/60">Detect early. Respond locally. Keep water flowing.</p>
          <UserCard name={name} membership={membership} onSignOut={signOut} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Phone header with hamburger */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-2 backdrop-blur md:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-xl text-ink hover:bg-surface-muted"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-6" aria-hidden />
          </button>
          <Logo size={28} />
          <span className="grid size-11 place-items-center">
            <span className="grid size-8 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {initials(name)}
            </span>
          </span>
        </header>

        {simulated && (
          <div className="flex items-center justify-center gap-2 bg-sim-soft px-4 py-2 text-center text-xs font-medium text-sim">
            <FlaskConical className="size-3.5 shrink-0" aria-hidden />
            SIMULATED demonstration data. Not live field readings.
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>

        {/* Phone bottom navigation */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
          aria-label="Main"
        >
          <NavLinks variant="bottom" />
        </nav>
      </div>

      {/* Phone slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-navy-950/50" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 bg-navy-900 p-4">
            <div className="flex items-center justify-between">
              <Logo inverted size={30} />
              <button
                onClick={() => setMenuOpen(false)}
                className="grid size-11 place-items-center rounded-xl text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <nav className="flex flex-col gap-1" aria-label="Main">
              <NavLinks variant="sidebar" onNavigate={() => setMenuOpen(false)} />
            </nav>
            <div className="mt-auto">
              <UserCard name={name} membership={membership} onSignOut={signOut} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
