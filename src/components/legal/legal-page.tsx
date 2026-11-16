"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { LEGAL_META, type Lang, type LegalDoc } from "@/lib/legal/content";
import { cn } from "@/lib/cn";

/** Public legal page (no sign-in needed) with an English / Kiswahili switch kept in the URL (?lang=sw). */
export function LegalPage({ docs }: { docs: Record<Lang, LegalDoc> }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lang: Lang = params.get("lang") === "sw" ? "sw" : "en";
  const doc = docs[lang];
  const sw = lang === "sw";

  return (
    <div lang={lang} className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 md:px-8 md:pt-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="AquaSentinel">
          <Logo height={34} />
        </Link>
        <div className="inline-flex rounded-full border border-line bg-surface p-1" role="group" aria-label={sw ? "Lugha" : "Language"}>
          {(["en", "sw"] as const).map((l) => (
            <button
              key={l}
              onClick={() => router.replace(l === "en" ? pathname : `${pathname}?lang=sw`, { scroll: false })}
              aria-pressed={lang === l}
              className={cn("min-h-10 rounded-full px-4 text-sm font-medium", lang === l ? "bg-info-soft text-ink" : "text-ink-muted hover:text-ink")}
            >
              {l === "en" ? "English" : "Kiswahili"}
            </button>
          ))}
        </div>
      </header>

      <main className="mt-10">
        <h1 className="type-h1 text-ink">{doc.title}</h1>
        <p className="mt-2 text-sm text-ink-subtle">
          {LEGAL_META.updated[lang]} · {sw ? "Toleo" : "Version"} {LEGAL_META.version}
        </p>
        <p className="mt-6 text-[17px] leading-relaxed text-ink-muted">{doc.intro}</p>

        <nav aria-label={sw ? "Yaliyomo" : "Contents"} className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <p className="type-eyebrow text-[10px] text-ink-subtle">{sw ? "Yaliyomo" : "Contents"}</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-accent hover:underline">{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-9">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-6">
              <h2 className="font-serif text-[26px] leading-tight text-ink">{s.heading}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-muted">
                {s.body.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="list-disc space-y-2 pl-5 marker:text-accent">
                      {b.map((li) => <li key={li}>{li}</li>)}
                    </ul>
                  ) : (
                    <p key={i}>{b}</p>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted">
          {sw ? "Maswali? Wasiliana nasi: " : "Questions? Contact us: "}
          <a href={`mailto:${LEGAL_META.contact}`} className="font-medium text-accent hover:underline">{LEGAL_META.contact}</a>
        </p>
      </main>

      <footer className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 text-sm text-ink-muted">
        <Link href={sw ? "/privacy?lang=sw" : "/privacy"} className="hover:text-ink">{sw ? "Taarifa ya Faragha" : "Privacy Notice"}</Link>
        <Link href={sw ? "/terms?lang=sw" : "/terms"} className="hover:text-ink">{sw ? "Masharti ya Matumizi" : "Terms of Use"}</Link>
        <Link href="/" className="hover:text-ink">{sw ? "Rudi kuingia" : "Back to sign in"}</Link>
      </footer>
    </div>
  );
}
