"use client";

import Link from "next/link";
import { ArrowRight, Check, Cookie, FileText, Mail, ShieldCheck, ShieldHalf } from "lucide-react";
import { CONTACT, DOC_ORDER, DOCS, HUB, UI, UPDATED, readingMinutes, type DocSlug } from "@/lib/legal/content";
import { LegalToolbar } from "./legal-toolbar";
import { useLang } from "./use-lang";

const CARD_ICON: Record<DocSlug, typeof FileText> = { privacy: ShieldCheck, terms: FileText, cookies: Cookie, security: ShieldHalf };

/** Trust & legal centre: one calm place that answers "what happens to my data?" before anyone has to ask. */
export function LegalHub() {
  const { lang, href } = useLang();
  const hub = HUB[lang];
  const t = UI[lang];
  return (
    <div className="relative">
        <div className="home-glow" aria-hidden />
        <section className="relative pb-10 pt-2 md:pt-4">
          <LegalToolbar />
          <p className="type-eyebrow mt-10 text-accent">{t.centre}</p>
          <h1 className="mt-4 font-serif text-[clamp(48px,7vw,96px)] leading-[0.92] tracking-[-0.03em] text-ink">
            {hub.title} <em className="italic text-as-teal-strong">{hub.emphasis}</em>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(17px,1.4vw,21px)] leading-relaxed text-ink-muted">{hub.lead}</p>
        </section>

        <section className="relative">
          <ul className="grid gap-4 md:grid-cols-2">
            {DOC_ORDER.map((slug) => {
              const doc = DOCS[slug][lang];
              const Icon = CARD_ICON[slug];
              return (
                <li key={slug}>
                  <Link
                    href={href(`/${slug}`)}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 md:p-7"
                  >
                    <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-accent">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="mt-5 font-serif text-[30px] leading-tight text-ink">{doc.title}</span>
                    <span className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-muted">{hub.cards[slug]}</span>
                    <span className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
                      <span className="text-ink-subtle">{t.updated} {UPDATED[lang]} · {readingMinutes(doc)} {t.minutes}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-accent">
                        {t.read} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="relative py-12">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-line bg-surface p-6 shadow-card md:p-7">
              <h2 className="font-serif text-[26px] text-ink">{t.rightsTitle}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {hub.rights.map((r) => (
                  <li key={r} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-soft px-4 py-2 text-sm text-ink">
                    <Check className="size-4 text-ok" aria-hidden /> {r}
                  </li>
                ))}
              </ul>
              <Link href={href("/privacy#rights")} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                {DOCS.privacy[lang].sections.find((s) => s.id === "rights")?.heading} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-card md:p-7">
              <h2 className="font-serif text-[26px] text-ink">{t.questions}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{t.questionsText}</p>
              <a href={`mailto:${CONTACT}`} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-as-orange px-5 text-sm font-semibold text-white shadow-sm hover:brightness-95">
                <Mail className="size-4" aria-hidden /> {CONTACT}
              </a>
            </div>
          </div>
        </section>
    </div>
  );
}
