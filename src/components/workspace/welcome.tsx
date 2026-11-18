"use client";

import { useSession } from "@/lib/auth/session";
import { firstName } from "@/lib/greeting";

/**
 * Temporary landing after sign-in while the signed-in experience is rebuilt one dashboard at a time
 * (owner decision, 18 Nov 2026). The next step replaces this with Operator Home.
 */
export function WorkspaceWelcome() {
  const session = useSession();
  const name = session.status === "signed_in" ? firstName(session.profile?.fullName ?? "") : "";
  return (
    <section className="mx-auto max-w-2xl py-10 text-center md:py-20">
      <h1 className="type-h1 text-ink">Welcome{name ? `, ${name}` : ""}.</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-muted">
        You&rsquo;re signed in. Your Operator Home is being built: it will show whether your water system is running well,
        any alert and who is handling it, and the one thing to do next.
      </p>
    </section>
  );
}
