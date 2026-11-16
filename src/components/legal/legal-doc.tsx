"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Clock, Link2, Mail, Printer, ShieldCheck } from "lucide-react";
import { CONTACT, DOC_ORDER, DOCS, HUB, UI, UPDATED, VERSION, readingMinutes, type Block, type DocSlug } from "@/lib/legal/content";
import { cn } from "@/lib/cn";
import { LEGAL_ICONS } from "./icons";
import { LegalToolbar } from "./legal-toolbar";
import { useLang } from "./use-lang";

function BlockView({ b }: { b: Block }) {
  if ("p" in b) return <p>{b.p}</p>;
  if ("note" in b) {
    return (
      <p className="flex gap-3 rounded-2xl border border-ok/20 bg-ok-soft px-4 py-3 text-ink">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
        <span>{b.note}</span>
      </p>
    );
  }
  if ("list" in b) {
    return (
      <ul className="space-y-2.5">
        {b.list.map((li) => (
          <li key={li} className="flex gap-3">
            <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span>{li}</span>
          </li>
        ))}
      </ul>
    );
  }
  const { head, rows } = b.table;
  return (
    <>
      {/* Laptop: a real table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-soft">
            <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.join("|")} className="border-t border-line align-top">
                {r.map((c, i) => <td key={i} className={cn("px-4 py-3", i === 0 ? "font-medium text-ink" : "text-ink-muted")}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phone: one card per row, so nothing scrolls sideways */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <dl key={r.join("|")} className="rounded-2xl border border-line bg-surface p-4">
            <dt className="sr-only">{head[0]}</dt>
            <dd className="font-medium text-ink">{r[0]}</dd>
            {r.slice(1).map((c, i) => (
              <div key={i} className="mt-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{head[i + 1]}</dt>
                <dd className="text-ink-muted">{c}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
    </>
  );
}

function CopyLink({ id, label, done }: { id: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          window.location.hash = id;
        }
      }}
      className="grid size-9 shrink-0 place-items-center rounded-full text-ink-subtle opacity-0 transition hover:bg-surface-muted hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 print:hidden"
      aria-label={copied ? done : label}
      title={copied ? done : label}
    >
      {copied ? <Check className="size-4 text-ok" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
    </button>
  );
}

/** Highlights the section currently being read in the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

/**
 * One trust & legal document: summary first, then the full text with a live table of contents.
 * Content only: the app shell (signed in) or the public layout (visitors) provides the surrounding chrome.
 */
export function LegalDoc({ slug }: { slug: DocSlug }) {
  const { lang, href } = useLang();
  const doc = DOCS[slug][lang];
  const t = UI[lang];
  const ids = doc.sections.map((s) => s.id);
  const active = useActiveSection(ids);
  const related = DOC_ORDER.filter((s) => s !== slug);

  const toc = (
    <ol className="space-y-0.5 text-sm">
      {doc.sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? "location" : undefined}
            className={cn(
              "flex gap-3 rounded-lg border-l-2 py-1.5 pl-3 pr-2 transition-colors",
              active === s.id ? "border-accent bg-info-soft/60 font-semibold text-ink" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            <span className="tabular w-5 shrink-0 text-ink-subtle">{String(i + 1).padStart(2, "0")}</span>
            {s.heading}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="relative">
        <div className="home-glow" aria-hidden />
        {/* Hero */}
        <section className="relative pb-8 pt-2 md:pt-4">
          <LegalToolbar title={doc.title} />
          <p className="type-eyebrow mt-8 text-accent">{doc.kicker}</p>
          <h1 className="mt-3 font-serif text-[clamp(44px,6vw,80px)] leading-[0.95] tracking-[-0.03em] text-ink">{doc.title}</h1>
          <p className="mt-5 max-w-3xl text-[clamp(17px,1.4vw,20px)] leading-relaxed text-ink-muted">{doc.lead}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">{t.updated} {UPDATED[lang]}</span>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5">{t.version} {VERSION}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
              <Clock className="size-3.5" aria-hidden /> {readingMinutes(doc)} {t.minutes}
            </span>
            <button onClick={() => window.print()} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 font-medium text-accent hover:bg-surface-muted print:hidden">
              <Printer className="size-4" aria-hidden /> {t.print}
            </button>
          </div>
        </section>

        {/* At a glance */}
        {doc.glance && (
          <section className="relative" aria-labelledby="glance">
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-card md:p-7">
              <h2 id="glance" className="font-serif text-[26px] text-ink">{t.glance}</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {doc.glance.map((g) => {
                  const Icon = LEGAL_ICONS[g.icon];
                  return (
                    <li key={g.title}>
                      <a href={g.href} className="flex h-full gap-3 rounded-2xl border border-line/70 bg-surface-soft p-4 transition-colors hover:border-accent/40 hover:bg-info-soft/50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info-soft text-accent">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-semibold text-ink">{g.title}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{g.text}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Body with table of contents */}
        <div className="relative grid gap-10 pb-16 pt-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="print:hidden">
            <details className="rounded-2xl border border-line bg-surface p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
                {t.onThisPage}
                <ChevronDown className="size-4 text-ink-muted" aria-hidden />
              </summary>
              <div className="mt-3">{toc}</div>
            </details>
            <nav aria-label={t.onThisPage} className="sticky top-24 hidden lg:block">
              <p className="type-eyebrow mb-3 text-[10px] text-ink-subtle">{t.onThisPage}</p>
              {toc}
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="group scroll-mt-24 border-t border-line py-9 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                  <span className="tabular mt-2 text-sm font-semibold text-ink-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="flex-1 font-serif text-[clamp(26px,2.4vw,32px)] leading-tight text-ink">{s.heading}</h2>
                  <CopyLink id={s.id} label={t.copyLink} done={t.copied} />
                </div>
                {s.short && (
                  <p className="mt-4 rounded-2xl border-l-4 border-accent bg-info-soft/60 px-4 py-3 text-[15px] text-ink">
                    <b className="mr-1 font-semibold">{t.inShort}:</b>
                    {s.short}
                  </p>
                )}
                <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-ink-muted">
                  {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
                </div>
              </section>
            ))}

            {/* Contact */}
            <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card sm:flex-row sm:items-center">
              <div className="flex-1">
                <h2 className="font-serif text-[24px] text-ink">{t.questions}</h2>
                <p className="mt-1 text-sm text-ink-muted">{t.questionsText}</p>
              </div>
              <a href={`mailto:${CONTACT}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-as-orange px-5 text-sm font-semibold text-white shadow-sm hover:brightness-95 print:hidden">
                <Mail className="size-4" aria-hidden /> {CONTACT}
              </a>
            </section>

            {/* Related documents */}
            <section className="mt-10 print:hidden" aria-label={t.allDocs}>
              <p className="type-eyebrow text-[10px] text-ink-subtle">{t.allDocs}</p>
              <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r}>
                    <Link href={href(`/${r}`)} className="group/card flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent/40">
                      <span className="font-semibold text-ink">{DOCS[r][lang].title}</span>
                      <span className="mt-1 flex-1 text-sm text-ink-muted">{HUB[lang].cards[r]}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                        {t.read} <ArrowRight className="size-4 transition-transform group-hover/card:translate-x-0.5" aria-hidden />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </div>
    </div>
  );
}
