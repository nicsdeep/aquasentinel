"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, Pencil, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL, useSession, type Role } from "@/lib/auth/session";
import { formatAge, secondsSince } from "@/lib/format";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

interface Person {
  user_id: string;
  full_name: string;
  email: string;
  role: Role;
  last_sign_in_at: string | null;
  phone_masked: string;
  is_platform_admin: boolean;
}

const ROLES: Role[] = ["operator", "technician", "committee", "admin"];
const field = "block min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm";

const ERRORS: Record<string, string> = {
  not_authorised: "Only the platform administrator can manage people.",
  invalid_name: "Enter a name (1 to 120 characters).",
  not_a_member: "This person is no longer on this site.",
  not_found: "This person could not be found.",
};

/** People console: who is on the site, their role and when they last signed in. Platform administrators only. */
export function PeopleConsole({ siteId, siteName }: { siteId: string; siteName: string }) {
  const session = useSession();
  const { notify } = useToast();
  const myId = session.status === "signed_in" ? session.user.id : null;
  const [people, setPeople] = useState<Person[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await getSupabase()!.rpc("admin_list_members", { p_site: siteId });
    if (error) return setFailed(true);
    setFailed(false);
    setPeople((data ?? []) as Person[]);
  }, [siteId]);

  // Live: any membership change on this site (role switch, another admin's edit) refreshes the list in place.
  useEffect(() => {
    const db = getSupabase()!;
    const first = setTimeout(load, 0);
    const channel = db
      .channel(`console-${siteId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_members", filter: `site_id=eq.${siteId}` }, () => void load())
      .subscribe();
    return () => {
      clearTimeout(first);
      db.removeChannel(channel);
    };
  }, [siteId, load]);

  function flash(id: string) {
    setSaved(id);
    setTimeout(() => setSaved((s) => (s === id ? null : s)), 2500);
  }

  async function setRole(p: Person, role: Role) {
    setBusy(p.user_id);
    const { data, error } = await getSupabase()!.rpc("admin_set_member_role", { p_site: siteId, p_user: p.user_id, p_role: role });
    setBusy(null);
    if (error || data !== "ok") return notify("error", ERRORS[String(data)] ?? "The role could not be changed. Try again.");
    await load();
    if (p.user_id === myId) await session.refresh();
    flash(p.user_id);
    notify("success", `${p.full_name} is now ${ROLE_LABEL[role]}.`);
  }

  async function saveName(p: Person, name: string) {
    setBusy(p.user_id);
    const { data, error } = await getSupabase()!.rpc("admin_update_profile", { p_user: p.user_id, p_full_name: name, p_locale: "en" });
    setBusy(null);
    if (error || data !== "ok") return notify("error", ERRORS[String(data)] ?? "The name could not be saved. Try again.");
    setEditing(null);
    await load();
    if (p.user_id === myId) await session.refresh();
    flash(p.user_id);
    notify("success", `Saved. ${name.trim()}'s name is updated.`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-[clamp(34px,4vw,52px)] leading-[1.05] tracking-[-0.02em] text-ink">People</h1>
        <p className="mt-2 text-[15px] text-ink-muted">Everyone on {siteName}, their role and when they last signed in.</p>
      </div>

      {failed && <Card className="p-5 font-medium text-crit" role="alert">The list could not be loaded. Check your connection and try again.</Card>}
      {!people && !failed && <div className="h-48 animate-pulse rounded-3xl bg-surface-muted" aria-label="Loading" />}

      {people && (
        <Card className="divide-y divide-line overflow-hidden p-0">
          {people.map((p) => (
            <div key={p.user_id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4 md:p-5">
              <div className="min-w-0 flex-1">
                {editing?.id === p.user_id ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void saveName(p, editing.name);
                    }}
                  >
                    <input autoFocus aria-label="Name" className={field} value={editing.name} onChange={(e) => setEditing({ id: p.user_id, name: e.target.value })} />
                    <Button type="submit" variant="dark" loading={busy === p.user_id} aria-label="Save name"><Check className="size-4" aria-hidden /></Button>
                    <Button type="button" variant="ghost" onClick={() => setEditing(null)} aria-label="Cancel"><X className="size-4" aria-hidden /></Button>
                  </form>
                ) : (
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                    {p.full_name}
                    {p.is_platform_admin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent">
                        <ShieldCheck className="size-3" aria-hidden /> Platform admin
                      </span>
                    )}
                    <button onClick={() => setEditing({ id: p.user_id, name: p.full_name })} className="grid size-8 place-items-center rounded-full text-ink-subtle hover:bg-surface-muted hover:text-ink" aria-label={`Edit ${p.full_name}'s name`}>
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                  </p>
                )}
                <p className="mt-0.5 truncate text-sm text-ink-muted">{p.email}</p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {p.last_sign_in_at ? `Last signed in ${formatAge(secondsSince(p.last_sign_in_at))}` : "Has not signed in yet"} · Phone {p.phone_masked}
                </p>
              </div>
              <div className="flex items-center gap-2 md:w-60">
                <select
                  aria-label={`Role for ${p.full_name}`}
                  className={field}
                  value={p.role}
                  disabled={busy === p.user_id}
                  onChange={(e) => void setRole(p, e.target.value as Role)}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
                <span className={cn("grid size-6 shrink-0 place-items-center", saved === p.user_id ? "text-ok" : "text-transparent")} aria-live="polite">
                  {busy === p.user_id ? <LoaderCircle className="size-4 animate-spin text-ink-subtle" aria-hidden /> : <Check className="size-4" aria-label={saved === p.user_id ? "Saved" : undefined} />}
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}
      <p className="text-sm text-ink-muted">To add someone new, invite their email in Supabase (Authentication → Users), then set their role here.</p>
    </div>
  );
}
