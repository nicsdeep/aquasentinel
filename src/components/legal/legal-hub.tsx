"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DOC_ORDER, DOCS, HUB, UI, UPDATED, VERSION } from "@/lib/legal/content";
import { BackLink, EmailUs, LangToggle } from "./legal-doc";
import { useLang } from "./use-lang";

/** Trust & legal centre, simplified: the four documents in one small centred card, and one button to email us. */
export function LegalHub() {
  const { lang, href } = useLang();
  const hub = HUB[lang];
  const t = UI[lang];
  return (
    <div className="mx-auto max-w-2xl pb-16 pt-4">
      <header className="text-center">
        <div className="text-left"><BackLink /></div>
        <h1 className="font-serif text-[clamp(40px,5vw,56px)] leading-[1] tracking-[-0.02em] text-ink">
          {hub.title} <em className="italic text-as-teal-strong">{hub.emphasis}</em>
        </h1>
        <p className="mt-3 text-xs text-ink-subtle">{t.updated} {UPDATED[lang]} · {t.version} {VERSION}</p>
        <div className="mt-1 flex justify-center"><LangToggle /></div>
      </header>
      <ul className="mt-8 divide-y divide-line rounded-3xl border border-line bg-surface px-5 shadow-card md:px-7">
        {DOC_ORDER.map((slug) => (
          <li key={slug}>
            <Link href={href(`/${slug}`)} className="flex items-center gap-3 py-4">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{DOCS[slug][lang].title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{hub.cards[slug]}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-ink-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <EmailUs lang={lang} />
    </div>
  );
}
