"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { getSupabase } from "@/lib/supabase/client";
import { OtpSignIn } from "./otp-sign-in";

/**
 * Sign-in: logo, the sign-in card and the Trust & legal links, nothing else (owner's choice, Option A, 18 Nov 2026).
 * What AquaSentinel is lives on the public website, so it is not repeated here.
 */
export function SignIn() {
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center">
        <Link href="/" aria-label="AquaSentinel website" className="inline-block">
          <Logo height={48} />
        </Link>
        <section className="mt-8 w-full rounded-panel border border-line bg-surface p-5 shadow-card md:p-8">
          <OtpSignIn onSignedIn={() => router.replace("/dashboard")} />
        </section>
        <p className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
          <Link href="/legal" className="font-medium text-accent hover:underline">Trust &amp; legal</Link>
          <Link href="/privacy" className="text-accent hover:underline">Privacy</Link>
          <Link href="/terms" className="text-accent hover:underline">Terms</Link>
          <Link href="/cookies" className="text-accent hover:underline">Cookies</Link>
          <Link href="/security" className="text-accent hover:underline">Security</Link>
          <Link href="/legal?lang=sw" className="text-accent hover:underline">Kiswahili</Link>
        </p>
      </div>
    </div>
  );
}
