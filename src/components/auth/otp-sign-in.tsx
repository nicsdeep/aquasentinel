"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

/** Plain-language messages for the errors people actually hit. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("signups not allowed") || m.includes("user not found") || m.includes("not allowed for otp"))
    return "This email isn't registered for AquaSentinel. Ask your administrator to add you.";
  if (m.includes("expired") || m.includes("invalid")) return "That code is wrong or has expired. Check it, or send a new one.";
  if (m.includes("rate") || m.includes("too many") || m.includes("security purposes"))
    return "Too many attempts. Please wait a minute and try again.";
  return message;
}

/**
 * Passwordless sign-in: email + one-time code (Supabase Auth OTP). Invite-only: codes are sent only to people an
 * administrator has added (shouldCreateUser: false). Mobile-number codes need an SMS provider and are shown as coming soon.
 */
export function OtpSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const supabase = getSupabase();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"address" | "code">("address");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function sendCode() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: e } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // If the email template contains a link instead of the code, the link returns here and signs the person in.
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/sign-in` },
    });
    setBusy(false);
    if (e) {
      setError(friendly(e.message));
      return;
    }
    setStep("code");
    setDigits(Array(CODE_LENGTH).fill(""));
    setWait(RESEND_SECONDS);
    setNotice(`We sent a ${CODE_LENGTH}-digit code to ${email.trim()}. It expires in a few minutes.`);
    setTimeout(() => boxes.current[0]?.focus(), 50);
  }

  async function verify(code: string) {
    if (!supabase || code.length !== CODE_LENGTH) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    if (e) {
      setBusy(false);
      setError(friendly(e.message));
      setDigits(Array(CODE_LENGTH).fill(""));
      boxes.current[0]?.focus();
      return;
    }
    onSignedIn();
  }

  function setDigit(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      // Pasted or autofilled code
      const next = clean.slice(0, CODE_LENGTH).split("");
      const filled = [...next, ...Array(CODE_LENGTH - next.length).fill("")];
      setDigits(filled);
      boxes.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      if (next.length === CODE_LENGTH) verify(next.join(""));
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) boxes.current[i + 1]?.focus();
    if (next.every(Boolean)) verify(next.join(""));
  }

  return (
    <div>
      <h2 className="type-h2">Sign in</h2>
      <p className="mt-1 text-sm text-ink-muted">No password needed. We send you a one-time code.</p>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface-muted p-1" role="tablist" aria-label="Sign in with">
        {(
          [
            ["email", "Email", Mail],
            ["phone", "Mobile number", Smartphone],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            role="tab"
            aria-selected={method === key}
            onClick={() => {
              setMethod(key);
              setError(null);
            }}
            className={cn(
              "flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors",
              method === key ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </button>
        ))}
      </div>

      {method === "phone" ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface-muted p-5 text-sm text-ink-muted" role="tabpanel">
          <p className="font-medium text-ink">Mobile sign-in is coming soon.</p>
          <p className="mt-1">
            Codes by SMS will be available once an SMS provider is connected. For now, please use your email address.
          </p>
          <button onClick={() => setMethod("email")} className="mt-3 font-medium text-accent hover:underline">
            Use email instead
          </button>
        </div>
      ) : step === "address" ? (
        <form
          className="mt-6 space-y-4"
          role="tabpanel"
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
        >
          <label className="block">
            <span className="text-sm font-medium">Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 block min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-crit-soft px-3 py-2 text-sm font-medium text-crit" role="alert">
              {error}
            </p>
          )}
          {!supabase && <p className="rounded-lg bg-off-soft px-3 py-2 text-sm text-off">The app is not connected to its database yet.</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} disabled={!supabase || busy}>
            Send code
          </Button>
        </form>
      ) : (
        <div className="mt-6 space-y-4" role="tabpanel">
          {notice && <p className="text-sm text-ink-muted" aria-live="polite">{notice}</p>}
          <fieldset>
            <legend className="text-sm font-medium">Enter the code</legend>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={i === 0 ? CODE_LENGTH : 1}
                  aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                  disabled={busy}
                  className="h-14 w-full rounded-xl border border-line bg-surface text-center text-2xl font-semibold tabular-nums focus:border-accent"
                />
              ))}
            </div>
          </fieldset>
          {error && (
            <p className="rounded-lg bg-crit-soft px-3 py-2 text-sm font-medium text-crit" role="alert">
              {error}
            </p>
          )}
          <Button variant="primary" size="lg" className="w-full" loading={busy} disabled={busy || digits.some((x) => !x)} onClick={() => verify(digits.join(""))}>
            Sign in
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button onClick={() => { setStep("address"); setError(null); }} className="inline-flex min-h-11 items-center gap-1.5 text-ink-muted hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> Change email
            </button>
            <button onClick={sendCode} disabled={wait > 0 || busy} className="min-h-11 font-medium text-accent hover:underline disabled:text-ink-subtle disabled:no-underline">
              {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-ink-subtle">
        By signing in you agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Use</Link> and{" "}
        <Link href="/privacy" className="text-accent hover:underline">Privacy Notice</Link>. Access is by invitation from
        your water system&rsquo;s administrator.
      </p>
    </div>
  );
}
