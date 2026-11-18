"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session";
import { PeopleConsole } from "./people-console";

/** Guards the People console: platform administrators only; everyone else goes back to Home. */
export function ConsoleScreen() {
  const session = useSession();
  const router = useRouter();
  const allowed = session.status === "signed_in" && !!session.profile?.isPlatformAdmin;
  const membership = session.status === "signed_in" ? session.memberships[0] : undefined;
  useEffect(() => {
    if (session.status === "signed_in" && !allowed) router.replace("/dashboard");
  }, [session.status, allowed, router]);
  if (!allowed || !membership) return null;
  return <PeopleConsole siteId={membership.siteId} siteName={membership.siteName} />;
}
