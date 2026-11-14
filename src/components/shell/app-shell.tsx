"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Bell, BookOpenCheck, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ReportProblemDialog } from "@/components/actions/report-problem";
import { RoutineCheckDialog } from "@/components/actions/routine-check";
import { Phone } from "@/components/sms/phone";
import { Sheet } from "@/components/ui/sheet";
import { ROLE_LABEL, useSession, type Membership } from "@/lib/auth/session";
import { SiteDataProvider, useSiteData } from "@/lib/data/site-data";
import { firstName } from "@/lib/greeting";
import { cn } from "@/lib/cn";
import { EnvironmentDialog } from "./environment-dialog";
import { NAV_ITEMS } from "./nav";
import { SearchBox } from "./search-box";
import { ShellContext, type ShellActions } from "./shell-context";
import { SiteMenu } from "./site-menu";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

/** Sub-pages of "Alerts & incidents" shown under it in the sidebar while that section is open. */
function IncidentSubNav() {
  const tab = useSearchParams().get("tab");
  const items = [
    { href: "/incidents", label: "Open", active: tab !== "closed" },
    { href: "/incidents?tab=closed", label: "Closed", active: tab === "closed" },
  ];
  return (
    <>
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.active ? "page" : undefined}
          className={cn(
            "flex min-h-10 items-center rounded-xl pl-11 pr-3 text-sm transition-colors",
            i.active ? "bg-info-soft font-semibold text-ink" : "text-ink-muted hover:bg-surface-muted",
          )}
        >
          {i.label}
        </Link>
      ))}
    </>
  );
}

function SidebarNav({ alerts }: { alerts: number }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = badge === "alerts" ? alerts : 0;
        return (
          <div key={href} className="space-y-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors",
                active ? "bg-info-soft font-semibold text-ink" : "text-ink-muted hover:bg-surface-muted hover:text-ink",
              )}
            >
              <Icon className={cn("size-[18px]", active ? "text-accent" : "text-ink-subtle")} strokeWidth={2} aria-hidden />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="grid min-w-6 place-items-center rounded-full bg-as-orange px-1.5 text-xs font-semibold text-white" aria-label={`${count} open`}>
                  {count}
                </span>
              )}
            </Link>
            {href === "/incidents" && active && (
              <Suspense>
                <IncidentSubNav />
              </Suspense>
            )}
          </div>
        );
      })}
    </>
  );
}

function BottomNav({ alerts }: { alerts: number }) {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map(({ href, short, icon: Icon, badge }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const count = badge === "alerts" ? alerts : 0;
        return (
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

/** Responsive app frame. Laptop: floating sidebar card + top bar card. Phone: compact header + bottom navigation. */
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
  const role = membership?.role;
  const canControl = role === "committee" || role === "admin";
  const canCheck = role === "operator" || role === "technician" || role === "admin";
  const unread = !!data?.lastMessageAt && (!seenAt || data.lastMessageAt > seenAt);

  return (
    <ShellContext.Provider value={actions}>
      <div className="min-h-dvh md:grid md:grid-cols-[17.5rem_minmax(0,1fr)]">
        {/* Laptop sidebar: a floating card */}
        <aside className="hidden md:block md:p-3 md:pr-0">
          <div className="sticky top-3 flex h-[calc(100dvh-1.5rem)] flex-col overflow-y-auto rounded-3xl border border-line bg-surface px-3 pb-4 pt-3 shadow-card">
            <Link href="/dashboard" className="block rounded-2xl bg-surface-soft px-4 py-4" aria-label="AquaSentinel home">
              <Logo height={34} />
            </Link>
            <div className="mx-1 mt-3 border-t border-line" />
            <p className="type-eyebrow px-3 pb-2 pt-5 text-[10px] text-ink-subtle">Main</p>
            <nav className="flex flex-col gap-1" aria-label="Main">
              <SidebarNav alerts={alerts} />
            </nav>
            <p className="type-eyebrow px-3 pb-2 pt-6 text-[10px] text-ink-subtle">Programme</p>
            <Link href="/brief" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-ink-muted hover:bg-surface-muted hover:text-ink">
              <BookOpenCheck className="size-[18px] text-ink-subtle" aria-hidden />
              How it meets the brief
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Top bar: a floating card on laptop, a compact header on phone */}
          <div className="sticky top-0 z-30 md:px-3 md:pt-3">
            <header className="flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur md:h-[4.25rem] md:rounded-3xl md:border md:px-5 md:shadow-card">
              <span className="md:hidden">
                <Logo height={28} />
              </span>
              {siteName && <SiteMenu name={siteName} />}
              <SearchBox
                incidents={data?.active ?? []}
                recent={data?.recent ?? []}
                canCheck={canCheck}
                onReport={actions.openReport}
                onRoutine={actions.openRoutine}
                onMessages={actions.openMessages}
              />
              <div className="ml-auto flex items-center gap-2 whitespace-nowrap md:gap-3">
                <span className="hidden text-sm text-ink-muted xl:inline">
                  Welcome <b className="font-semibold text-ink">{firstName(name) || name}</b>
                </span>
                {role && (
                  <span className="hidden rounded-full bg-info-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent lg:inline">
                    {ROLE_LABEL[role]}
                  </span>
                )}
                <button
                  onClick={actions.openMessages}
                  className="relative grid size-11 place-items-center rounded-full border border-line bg-surface text-ink hover:bg-surface-muted"
                  aria-label={unread ? "Messages, new messages" : "Messages"}
                >
                  <Bell className="size-[18px]" aria-hidden />
                  {unread && <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-as-orange ring-2 ring-surface" aria-hidden />}
                </button>
                <button onClick={() => setPanel("environment")} className="grid size-11 place-items-center rounded-full" aria-label="Account and environment">
                  <span className="grid size-10 place-items-center rounded-full bg-surface-muted text-sm font-bold text-ink-muted">{initials(name)}</span>
                </button>
              </div>
            </header>
          </div>

          <main className="relative mx-auto w-full max-w-[88rem] flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">{children}</main>

          {/* Phone bottom navigation */}
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
            <BottomNav alerts={alerts} />
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
