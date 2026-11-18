"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Mail, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { canGoBackInApp } from "@/lib/nav-history";
import { CONTACT, DOCS, UI, UPDATED, VERSION, type Block, type DocSlug } from "@/lib/legal/content";
import { cn } from "@/lib/cn";
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

/** Small "English · Kiswahili" text toggle, kept in the URL (?lang=sw) so every page can be linked in Kiswahili. */
export function LangToggle() {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <p className="text-sm print:hidden" role="group" aria-label={UI[lang].language}>
      {(["en", "sw"] as const).map((l, i) => (
        <span key={l}>
          {i > 0 && <span className="mx-2 text-ink-subtle" aria-hidden>·</span>}
          <button
            onClick={() => router.replace(`${pathname}${l === "sw" ? "?lang=sw" : ""}${window.location.hash}`, { scroll: false })}
            aria-pressed={lang === l}
            className={cn("min-h-11 font-medium", lang === l ? "text-ink underline decoration-accent decoration-2 underline-offset-4" : "text-ink-muted hover:text-ink")}
          >
            {l === "en" ? "English" : "Kiswahili"}
          </button>
        </span>
      ))}
    </p>
  );
}

/** Quiet "Back" text link: returns to the previous screen when it is one of ours, otherwise to Home. */
export function BackLink() {
  const { lang } = useLang();
  const router = useRouter();
  const session = useSession();
  return (
    <button
      onClick={() => (canGoBackInApp() ? router.back() : router.push(session.status === "signed_in" ? "/dashboard" : "/"))}
      className="inline-flex min-h-11 items-center gap-1 text-sm text-ink-muted hover:text-ink print:hidden"
    >
      <ArrowLeft className="size-4" aria-hidden /> {lang === "sw" ? "Rudi" : "Back"}
    </button>
  );
}

/** The one useful action on every trust & legal page. */
export function EmailUs({ lang }: { lang: "en" | "sw" }) {
  const t = UI[lang];
  return (
    <div className="mt-8 text-center print:hidden">
      <p className="text-sm text-ink-muted">{t.questionsText}</p>
      <a href={`mailto:${CONTACT}`} className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-as-orange px-6 text-sm font-semibold text-white shadow-sm hover:brightness-95">
        <Mail className="size-4" aria-hidden /> {t.emailUs}
      </a>
    </div>
  );
}

/**
 * One trust & legal document, simplified for people with little time (owner request, 18 Nov 2026): a small centred
 * page that shows each section in one sentence; the full text opens on tap. All text stays complete and true.
 */
export function LegalDoc({ slug }: { slug: DocSlug }) {
  const { lang } = useLang();
  const doc = DOCS[slug][lang];
  const t = UI[lang];
  const [open, setOpen] = useState<string | null>(null);

  // A link to a section (e.g. /privacy#rights) opens that section.
  useEffect(() => {
    const show = () => {
      const id = window.location.hash.slice(1);
      if (id && doc.sections.some((s) => s.id === id)) {
        setOpen(id);
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 50);
      }
    };
    show();
    window.addEventListener("hashchange", show);
    return () => window.removeEventListener("hashchange", show);
  }, [doc.sections]);

  const header = (
    <header className="text-center">
      <div className="text-left"><BackLink /></div>
      <h1 className="font-serif text-[clamp(40px,5vw,56px)] leading-[1] tracking-[-0.02em] text-ink">{doc.title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">{doc.lead}</p>
      <p className="mt-3 text-xs text-ink-subtle">{t.updated} {UPDATED[lang]} · {t.version} {VERSION}</p>
      <div className="mt-1 flex justify-center"><LangToggle /></div>
    </header>
  );

  const rows = (
    <ul className="divide-y divide-line">
      {doc.sections.map((s) => {
        const expanded = open === s.id;
        return (
          <li key={s.id} id={s.id} className="scroll-mt-24">
            <button
              onClick={() => setOpen(expanded ? null : s.id)}
              aria-expanded={expanded}
              className="flex w-full items-start gap-3 py-4 text-left print:hidden"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-ink">{s.heading}</span>
                {s.short && <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{s.short}</span>}
              </span>
              <ChevronDown className={cn("mt-1 size-5 shrink-0 text-ink-subtle transition-transform", expanded && "rotate-180")} aria-hidden />
            </button>
            <h2 className="hidden py-3 font-semibold text-ink print:block">{s.heading}</h2>
            <div className={cn("space-y-3 pb-5 text-[15px] leading-relaxed text-ink-muted print:block", expanded ? "block" : "hidden")}>
              {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="mx-auto max-w-2xl pb-16 pt-4">
      {header}
      <section className="mt-8 border-t border-line">{rows}</section>
      <EmailUs lang={lang} />
    </div>
  );
}
