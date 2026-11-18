"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL, useSession, type Role } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const ROLES: Role[] = ["operator", "technician", "committee", "admin"];

/**
 * Platform admins switch their own role on the site. The database really applies it (RLS and workflow rules), so the
 * whole app behaves exactly as for that person. The change arrives live through the session's realtime subscription.
 */
export function RoleSwitch({ siteId, current, className }: { siteId: string; current: Role; className?: string }) {
  const session = useSession();
  const { notify } = useToast();
  const [pending, setPending] = useState<Role | null>(null);

  async function choose(role: Role) {
    if (role === current || pending) return;
    setPending(role);
    const { data, error } = await getSupabase()!.rpc("switch_my_role", { p_site: siteId, p_role: role });
    if (error || data !== "ok") {
      setPending(null);
      return notify("error", data === "not_authorised" ? "Only the platform administrator can switch roles." : "The role could not be switched. Try again.");
    }
    await session.refresh();
    setPending(null);
    notify("success", `You're now viewing as ${ROLE_LABEL[role]}.`);
  }

  return (
    <div className={cn("grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface-muted p-1 sm:grid-cols-4", className)} role="radiogroup" aria-label="View as">
      {ROLES.map((r) => (
        <button
          key={r}
          role="radio"
          aria-checked={current === r}
          onClick={() => choose(r)}
          disabled={pending !== null}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-sm font-medium transition-colors",
            current === r ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
          )}
        >
          {pending === r ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : current === r ? <Check className="size-4 text-accent" aria-hidden /> : null}
          {ROLE_LABEL[r]}
        </button>
      ))}
    </div>
  );
}
