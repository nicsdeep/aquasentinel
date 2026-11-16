"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSession } from "@/lib/auth/session";
import { canGoBackInApp } from "@/lib/nav-history";
import { UI } from "@/lib/legal/content";
import { cn } from "@/lib/cn";
import { useLang } from "./use-lang";

/**
 * Top row of every trust & legal page, in both layouts: Back (returns to the previous screen, keeping the workflow),
 * breadcrumb, and the English / Kiswahili switch (kept in the URL).
 */
export function LegalToolbar({ title }: { title?: string }) {
  const { lang, href } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const t = UI[lang];
  const signedIn = session.status === "signed_in";
  const fallback = signedIn ? "/dashboard" : "/";

  function back() {
    // Return to the previous screen (keeping its state) when it is one of ours; otherwise open a sensible home.
    if (canGoBackInApp()) router.back();
    else router.push(fallback);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 print:hidden">
      <button onClick={back} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted">
        <ArrowLeft className="size-4" aria-hidden />
        {lang === "sw" ? "Rudi" : "Back"}
      </button>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        {title ? (
          <>
            <Link href={href("/legal")} className="hover:text-ink">{t.centre}</Link>
            <span className="mx-2 text-ink-subtle" aria-hidden>/</span>
            <span className="text-ink">{title}</span>
          </>
        ) : (
          <span className="text-ink">{t.centre}</span>
        )}
      </nav>
      <div className="ml-auto inline-flex rounded-full border border-line bg-surface p-1" role="group" aria-label={t.language}>
        {(["en", "sw"] as const).map((l) => (
          <button
            key={l}
            onClick={() => router.replace(`${pathname}${l === "sw" ? "?lang=sw" : ""}${window.location.hash}`, { scroll: false })}
            aria-pressed={lang === l}
            className={cn("min-h-9 rounded-full px-3.5 text-sm font-medium transition-colors", lang === l ? "bg-info-soft text-ink" : "text-ink-muted hover:text-ink")}
          >
            {l === "en" ? "English" : "Kiswahili"}
          </button>
        ))}
      </div>
    </div>
  );
}
