"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, ClipboardList, MessageSquareText, Siren, UserRound, Users, Wrench } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { SimulatedBadge } from "@/components/ui/badge";
import { getSupabase } from "@/lib/supabase/client";

/** Public demo accounts. They can only see the SIMULATED demonstration site (enforced by RLS). */
const DEMO_PASSWORD = "AquaSentinel-Demo-2026";
const DEMO_ROLES = [
  {
    email: "operator.demo@example.com",
    title: "Operator",
    description: "Watches the water system and responds to alerts.",
    icon: UserRound,
  },
  {
    email: "technician.demo@example.com",
    title: "Technician",
    description: "Inspects, repairs and confirms the water is flowing again. Gets SMS in Kiswahili.",
    icon: Wrench,
  },
  {
    email: "committee.demo@example.com",
    title: "Water committee",
    description: "Oversees reliability and costs, and can run the demonstration.",
    icon: Users,
  },
];

const LOOP = [
  { icon: Siren, title: "Detect early", text: "Readings from the pump, flow, storage and solar power are checked against clear rules." },
  { icon: MessageSquareText, title: "Respond locally", text: "Alerts reach any phone by SMS, even without internet. Local technicians reply and act." },
  { icon: ClipboardList, title: "Keep water flowing", text: "Every fault, repair and recovery is recorded, so the next failure can be prevented." },
];

export function SignIn() {
  const router = useRouter();
  const supabase = getSupabase();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/dashboard");
    });
  }, [supabase, router]);

  async function signIn(key: string, credentials: { email: string; password: string }) {
    if (!supabase) return;
    setBusy(key);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword(credentials);
    if (authError) {
      setError(authError.message === "Invalid login credentials" ? "Email or password is incorrect." : authError.message);
      setBusy(null);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1.1fr_1fr] md:px-8">
      <section>
        <Logo size={44} />
        <h1 className="mt-8 text-4xl font-bold tracking-tight text-navy-800 md:text-5xl dark:text-white">AquaSentinel</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-muted">
          Helps communities keep the water systems they already have working: early warnings, local response and a
          clear maintenance record.
        </p>
        <ul className="mt-8 space-y-4">
          {LOOP.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-info-soft text-info">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-ink">{title}</p>
                <p className="text-sm text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-xl text-xs text-ink-subtle">
          AquaSentinel monitors, warns and coordinates. It does not control pumps, replace repairs or guarantee water
          safety. Independent project; no partnership is implied.
        </p>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Try the demo</h2>
          <SimulatedBadge />
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Choose a role. Demo accounts see only a simulated Ngomano water system, never real data.
        </p>

        <div className="mt-5 space-y-2.5">
          {DEMO_ROLES.map(({ email: demoEmail, title, description, icon: Icon }) => (
            <button
              key={demoEmail}
              onClick={() => signIn(demoEmail, { email: demoEmail, password: DEMO_PASSWORD })}
              disabled={!supabase || busy !== null}
              className="group flex w-full items-center gap-4 rounded-xl border border-line p-4 text-left transition-colors hover:border-sky-500 hover:bg-surface-muted disabled:opacity-60"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-800 text-white">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">Continue as {title}</span>
                <span className="block text-sm text-ink-muted">{description}</span>
              </span>
              <ChevronRight className="size-5 text-ink-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          ))}
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-subtle">
          <span className="h-px flex-1 bg-line" /> or sign in with your account <span className="h-px flex-1 bg-line" />
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            signIn("form", { email, password });
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-crit-soft px-3 py-2 text-sm font-medium text-crit" role="alert">
              {error}
            </p>
          )}
          {!supabase && (
            <p className="rounded-lg bg-off-soft px-3 py-2 text-sm text-off">The app is not connected to its database yet.</p>
          )}
          <Button type="submit" className="w-full" loading={busy === "form"} disabled={!supabase || busy !== null}>
            Sign in
          </Button>
        </form>
      </section>
    </div>
  );
}
