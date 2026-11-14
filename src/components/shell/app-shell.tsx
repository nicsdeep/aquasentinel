"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, ChevronRight, LoaderCircle, LogOut, MapPin, MessageSquare } from "lucide-react";
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
              active ? "bg-as-teal/20 font-medium text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
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
  const actions = useMemo<ShellActions>(
    () => ({ openMessages: () => setPanel("messages"), openReport: () => setPanel("report"), openRoutine: () => setPanel("routine") }),
    [],
  );
  const alerts = data?.active.length ?? 0;
  const siteName = data?.site.name ?? membership?.siteName ?? "";
  const tz = data?.site.timezone ?? membership?.timezone ?? "Africa/Nairobi";
  const canControl = membership?.role === "committee" || membership?.role === "admin";

  return (
    <ShellContext.Provider value={actions}>
      <div className="min-h-dvh md:grid md:grid-cols-[17rem_1fr]">
        {/* Laptop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col bg-gradient-to-b from-as-navy to-as-night px-4 py-6 md:flex">
          <Link href="/dashboard" className="px-2">
            <Logo inverted height={40} />
          </Link>
          <nav className="mt-10 flex flex-col gap-1" aria-label="Main">
            <NavLinks variant="sidebar" alerts={alerts} />
          </nav>
          <div className="mt-auto space-y-3">
            <Link href="/brief" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/60 hover:bg-white/5 hover:text-white">
              <BookOpenCheck className="size-4" aria-hidden />
              How it meets the brief
            </Link>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-as-teal text-sm font-semibold text-as-dark">{initials(name)}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{name}</p>
                  {membership && <p className="truncate text-xs text-white/60">{ROLE_LABEL[membership.role]}</p>}
                </div>
              </div>
              <button onClick={() => setPanel("environment")} className="mt-3 flex min-h-9 w-full items-center justify-between rounded-lg px-2 text-left text-xs text-white/60 hover:bg-white/5 hover:text-white">
                Demonstration environment
                <ChevronRight className="size-3.5" aria-hidden />
              </button>
              <button onClick={onSignOut} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-2 text-xs text-white/60 hover:bg-white/5 hover:text-white">
                <LogOut className="size-3.5" aria-hidden />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Top bar (laptop) / header (phone) */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/70 bg-canvas/90 px-4 backdrop-blur md:px-8">
            <span className="md:hidden">
              <Logo height={30} />
            </span>
            {siteName && (
              <span className="hidden items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium md:inline-flex">
                <MapPin className="size-4 text-accent" aria-hidden />
                {siteName}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setPanel("messages")} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink hover:bg-surface-muted" aria-label="Messages">
                <MessageSquare className="size-5" aria-hidden />
                <span className="hidden sm:inline">Messages</span>
              </button>
              <button onClick={() => setPanel("environment")} className="grid size-11 place-items-center rounded-full md:hidden" aria-label="Account">
                <span className="grid size-9 place-items-center rounded-full bg-as-teal text-xs font-semibold text-as-dark">{initials(name)}</span>
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>

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
