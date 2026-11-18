"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClipboardList, MessageSquareText, Siren } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getSupabase } from "@/lib/supabase/client";
import { OtpSignIn } from "./otp-sign-in";

const LOOP = [
  { icon: Siren, title: "Detect early", text: "Readings from the pump, flow, storage and solar power are checked against clear rules." },
  { icon: MessageSquareText, title: "Respond locally", text: "Alerts reach any phone by SMS, even without internet. Local technicians reply and act." },
  { icon: ClipboardList, title: "Keep water flowing", text: "Every fault, repair and recovery is recorded, so the next failure can be prevented." },
];

export function SignIn() {
  const router = useRouter();
  const supabase = getSupabase();

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-[1200px] items-center gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr] md:px-10 md:py-20">
      <section>
        <Link href="/" aria-label="AquaSentinel website" className="inline-block">
          <Logo height={48} />
        </Link>
        <Eyebrow className="mt-10">Community water reliability</Eyebrow>
        <h1 className="type-display mt-3 text-ink">AquaSentinel</h1>
        <p className="mt-5 max-w-xl text-[clamp(17px,1.5vw,22px)] leading-normal text-ink-muted">
          Helps communities keep the water systems they already have working: early warnings, local response and a
          clear maintenance record.
        </p>
        <ul className="mt-8 space-y-5 rounded-panel bg-surface-warm p-6 md:p-7">
          {LOOP.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-as-dark text-as-teal">
                <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
              </span>
              <div>
                <p className="type-h2 text-[22px] text-ink">{title}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-xl text-xs text-ink-subtle">
          AquaSentinel monitors, warns and coordinates. It does not control pumps, replace repairs or guarantee water
          safety. Independent project; no partnership is implied.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Link href="/legal" className="font-medium text-accent hover:underline">Trust &amp; legal</Link>
          <Link href="/privacy" className="text-accent hover:underline">Privacy</Link>
          <Link href="/terms" className="text-accent hover:underline">Terms</Link>
          <Link href="/cookies" className="text-accent hover:underline">Cookies</Link>
          <Link href="/security" className="text-accent hover:underline">Security</Link>
          <Link href="/legal?lang=sw" className="text-accent hover:underline">Kiswahili</Link>
        </p>
      </section>

      <section className="rounded-panel border border-line bg-surface p-5 shadow-card md:p-8">
        <OtpSignIn onSignedIn={() => router.replace("/dashboard")} />
      </section>
    </div>
  );
}
