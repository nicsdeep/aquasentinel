"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CONTACT, DOC_ORDER, DOCS, UI } from "@/lib/legal/content";
import { cn } from "@/lib/cn";
import { useLang } from "./use-lang";

/**
 * Public layout for visitors (not signed in) on trust & legal pages: logo, centre link, sign-in, document index.
 * Signed-in users see the same page content inside the app shell instead (see AppShell).
 */
export function LegalChrome({ children }: { children: React.ReactNode }) {
  const { lang, href } = useLang();
  const pathname = usePathname();
  const t = UI[lang];
  return (
    <div lang={lang} className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 md:px-8">
          <Link href="/" aria-label="AquaSentinel">
            <Logo height={30} />
          </Link>
          <span className="hidden h-6 w-px bg-line sm:block" aria-hidden />
          <Link href={href("/legal")} className="hidden text-sm font-semibold text-ink hover:text-accent sm:block">
            {t.centre}
          </Link>
          <Link href="/sign-in" className="ml-auto inline-flex min-h-10 items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-muted">
            {lang === "sw" ? "Ingia" : "Sign in"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-6 md:px-8 md:pt-8">{children}</main>

      <footer className="border-t border-line bg-surface print:hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr] md:px-8">
          <div>
            <Logo height={28} />
            <p className="mt-3 max-w-sm text-sm text-ink-muted">
              {lang === "sw"
                ? "AquaSentinel inafuatilia, inatahadharisha na kuratibu. Haidhibiti pampu kamwe."
                : "AquaSentinel monitors, warns and coordinates. It never controls pumps."}
            </p>
            <a href={`mailto:${CONTACT}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
              <Mail className="size-4" aria-hidden /> {CONTACT}
            </a>
          </div>
          <nav aria-label={t.allDocs}>
            <p className="type-eyebrow text-[10px] text-ink-subtle">{t.allDocs}</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <li><Link href={href("/legal")} className={cn("hover:text-ink", pathname === "/legal" ? "font-semibold text-ink" : "text-ink-muted")}>{t.centre}</Link></li>
              {DOC_ORDER.map((slug) => (
                <li key={slug}>
                  <Link href={href(`/${slug}`)} className={cn("hover:text-ink", pathname === `/${slug}` ? "font-semibold text-ink" : "text-ink-muted")}>
                    {DOCS[slug][lang].title}
                  </Link>
                </li>
              ))}
              <li><Link href="/" className="text-ink-muted hover:text-ink">{t.backToApp}</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
