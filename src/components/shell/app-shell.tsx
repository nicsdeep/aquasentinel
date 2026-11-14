"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Check, ChevronDown, ChevronRight, LoaderCircle, MapPin, MessageSquare } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ReportProblemDialog } from "@/components/actions/report-problem";
import { RoutineCheckDialog } from "@/components/actions/routine-check";
import { Phone } from "@/components/sms/phone";
import { Sheet } from "@/components/ui/sheet";
import { ROLE_LABEL, useSession, type Membership } from "@/lib/auth/session";
import { SiteDataProvider, useSiteData } from "@/lib/data/site-data";
import { cn } from "@/lib/cn";
import { EnvironmentDialog } from "./environment-dialog";
import { NAV_ITEMS } from "./nav";
import { ShellContext, type ShellActions } from "./shell-context";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function NavLinks({ variant, alerts }: { variant: "sidebar" | "bottom"; alerts: number }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, label, short, icon: Icon, badge }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = badge === "alerts" ? alerts : 0;
        return variant === "sidebar" ? (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors",
              active ? "bg-as-lagoon font-semibold text-white shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className="grid min-w-6 place-items-center rounded-full bg-as-orange px-1.5 text-xs font-semibold text-white" aria-label={`${count} open`}>
                {count}
              </span>
            )}
          </Link>
        ) : (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium", active ? "text-accent" : "text-ink-muted")}
          >
            <Icon className="size-[22px]" strokeWidth={2} aria-hidden />
            {short}
            {count > 0 && (
              <span className="absolute left-1/2 top-1.5 ml-2 grid min-w-5 place-items-center rounded-full bg-as-orange px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

/** Responsive app frame. Laptop: deep-teal sidebar + top bar. Phone: compact header + bottom navigation. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "signed_out") router.replace("/");
  }, [session.status, router]);

  if (session.status !== "signed_in") {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-ink-muted">
        {session.status === "unconfigured" ? <p>The app is not connected to its database yet.</p> : <LoaderCircle className="size-6 animate-spin" aria-label="Loading" />}
      </div>
    );
  }

  const membership = session.memberships[0];
  return (
    <SiteDataProvider siteId={membership?.siteId}>
      <Frame name={session.profile?.fullName ?? session.user.email ?? "User"} membership={membership} userId={session.user.id} locale={session.profile?.locale ?? "en"} onSignOut={async () => { await session.signOut(); router.replace("/"); }}>
        {children}
      </Frame>
    </SiteDataProvider>
  );
}

function Frame({
  name,
  membership,
  userId,
  locale,
  onSignOut,
  children,
}: {
  name: string;
  membership: Membership | undefined;
  userId: string;
  locale: "en" | "sw";
  onSignOut: () => void;
  children: React.ReactNode;
}) {
  const { data, reload } = useSiteData();
  const [panel, setPanel] = useState<"messages" | "report" | "routine" | "environment" | null>(null);
  // Frame renders only after the client session loads, so reading browser storage here is safe.
  const [seenAt, setSeenAt] = useState<string | null>(readSeen);
  const actions = useMemo<ShellActions>(
    () => ({
      openMessages: () => {
        const at = new Date().toISOString();
        writeSeen(at);
        setSeenAt(at);
        setPanel("messages");
      },
      openReport: () => setPanel("report"),
      openRoutine: () => setPanel("routine"),
    }),
    [],
  );
  const alerts = data?.active.length ?? 0;
  const siteName = data?.site.name ?? membership?.siteName ?? "";
  const tz = data?.site.timezone ?? membership?.timezone ?? "Africa/Nairobi";
  const canControl = membership?.role === "committee" || membership?.role === "admin";
  const pathname = usePathname();
  const home = pathname === "/dashboard";
  const scrolled = useScrolled();
  const unread = !!data?.lastMessageAt && (!seenAt || data.lastMessageAt > seenAt);

  return (
    <ShellContext.Provider value={actions}>
      <div className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
        {/* Laptop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col overflow-hidden bg-gradient-to-b from-as-sidebar to-as-sidebar-deep px-4 py-6 md:flex">
          <div className="sidebar-waves pointer-events-none absolute inset-x-0 top-[38%] h-[48%] bg-[url('/art/sidebar-waves.svg')] bg-[length:100%_100%] bg-no-repeat" aria-hidden />
          <Link href="/dashboard" className="relative px-2">
            <Logo inverted height={40} />
          </Link>
          <nav className="relative mt-10 flex flex-col gap-1.5" aria-label="Main">
            <NavLinks variant="sidebar" alerts={alerts} />
          </nav>
          <div className="relative mt-auto space-y-3">
            <Link href="/brief" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/80 hover:bg-white/10 hover:text-white">
              <BookOpenCheck className="size-4" aria-hidden />
              How it meets the brief
            </Link>
            <button
              onClick={() => setPanel("environment")}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-left hover:bg-white/10"
              aria-label="Account and environment"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-as-teal text-sm font-semibold text-as-dark">{initials(name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-white">{name}</span>
                {membership && <span className="block truncate text-xs text-white/70">{ROLE_LABEL[membership.role]}</span>}
              </span>
              <ChevronRight className="size-4 shrink-0 text-white/70" aria-hidden />
            </button>
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-col">
          {home && <div className="home-backdrop" aria-hidden />}
          {/* Top bar (laptop) / header (phone). On Home it sits on the header art until the page scrolls. */}
          <header
            className={cn(
              "sticky top-0 z-30 flex h-16 items-center gap-3 px-4 transition-colors md:h-[4.5rem] md:px-8",
              home && !scrolled ? "bg-transparent" : "border-b border-line/70 bg-canvas/90 backdrop-blur",
            )}
          >
            <span className="md:hidden">
              <Logo height={30} />
            </span>
            {siteName && <SiteMenu name={siteName} />}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={actions.openMessages} className="relative inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[15px] font-medium text-ink hover:bg-surface/70" aria-label={unread ? "Messages, new messages" : "Messages"}>
                <MessageSquare className="size-5" aria-hidden />
                <span className="hidden sm:inline">Messages</span>
                {unread && <span className="absolute right-1.5 top-2 size-2.5 rounded-full bg-as-teal ring-2 ring-canvas" aria-hidden />}
              </button>
              <button onClick={() => setPanel("environment")} className="grid size-11 place-items-center rounded-full md:hidden" aria-label="Account">
                <span className="grid size-9 place-items-center rounded-full bg-as-teal text-xs font-semibold text-as-dark">{initials(name)}</span>
              </button>
            </div>
          </header>

          <main className={cn("relative mx-auto w-full flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12", home ? "max-w-[88rem] md:pt-4" : "max-w-6xl md:pt-6")}>{children}</main>

          {/* Phone bottom navigation */}
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
            <NavLinks variant="bottom" alerts={alerts} />
          </nav>
        </div>
      </div>

      <Sheet open={panel === "messages"} onClose={() => setPanel(null)} title="Messages">
        <Phone userId={userId} locale={locale} timezone={tz} />
      </Sheet>
      {membership && (
        <>
          <ReportProblemDialog open={panel === "report"} onClose={() => setPanel(null)} siteId={membership.siteId} />
          <RoutineCheckDialog open={panel === "routine"} onClose={() => setPanel(null)} siteId={membership.siteId} onDone={reload} />
          <EnvironmentDialog
            open={panel === "environment"}
            onClose={() => setPanel(null)}
            siteId={membership.siteId}
            canControl={canControl}
            account={{ name, role: ROLE_LABEL[membership.role] }}
            onSignOut={onSignOut}
            onDone={() => {
              reload();
              setPanel(null);
            }}
          />
        </>
      )}
    </ShellContext.Provider>
  );
}

const SEEN_KEY = "as-messages-seen";
function readSeen(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
}
function writeSeen(at: string) {
  try {
    localStorage.setItem(SEEN_KEY, at);
  } catch {
    /* private mode: the dot simply shows again next time */
  }
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return scrolled;
}

/** Site switcher. Members currently belong to one site; the menu shows it and opens its details. */
function SiteMenu({ name }: { name: string }) {
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
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[15px] font-medium shadow-sm hover:bg-surface-muted"
      >
        <MapPin className="size-4 text-accent" aria-hidden />
        {name}
        <ChevronDown className={cn("size-4 text-accent transition-transform", open && "rotate-180")} aria-hidden />
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
