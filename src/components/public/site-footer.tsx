import Link from "next/link";
import { ChevronDown, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CONTACT } from "@/lib/legal/content";
import { SITE_NAV } from "@/lib/site/content";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";

const EXPLORE = [...SITE_NAV.map(({ href, label }) => ({ href, label })), { href: "/demoppt", label: "Demo PPT" }, { href: "/contact", label: "Contact" }];
const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/security", label: "Security" },
];

function Links({ items }: { items: { href: string; label: string }[] }) {
  return (
    <ul className="space-y-1 md:space-y-2.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="flex min-h-11 items-center text-[15px] text-white/80 hover:text-white md:min-h-0">{i.label}</Link>
        </li>
      ))}
    </ul>
  );
}

/** Mobile: a collapsible group (only where it shortens the page). Laptop: an open column. */
function Group({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <>
      <details className="group border-b border-white/10 md:hidden">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between text-[15px] font-semibold text-white">
          {title}
          <ChevronDown className="size-5 text-lp-cyan transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="pb-3">
          <Links items={items} />
        </div>
      </details>
      <nav aria-label={title} className="hidden md:block">
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-lp-cyan">{title}</p>
        <div className="mt-4">
          <Links items={items} />
        </div>
      </nav>
    </>
  );
}

/** Shared public footer: logo, water wave, simple links, policies, verified contact, deep-navy copyright strip. */
export function SiteFooter() {
  return (
    <footer className="relative mt-auto bg-lp-ink text-white">
      <svg className="absolute inset-x-0 -top-px h-6 w-full -translate-y-full md:h-10" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
        <path d="M0 34C240 6 480 6 720 26s480 30 720 4V60H0Z" fill="var(--color-lp-cyan)" opacity="0.55" />
        <path d="M0 46C260 22 500 22 740 38s460 22 700 0V60H0Z" fill="var(--color-lp-ink)" />
      </svg>
      <div className={cn(siteContainer, "grid gap-6 pb-8 pt-8 md:grid-cols-[1.3fr_1fr_1fr] md:gap-10 md:pb-12 md:pt-12")}>
        <div>
          <Logo inverted height={40} />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">
            A proposed tool to help communities monitor, respond to and maintain their water systems. It would never control pumps.
          </p>
          <a href={`mailto:${CONTACT}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-white hover:text-lp-cyan">
            <Mail className="size-4 text-lp-cyan" aria-hidden /> {CONTACT}
          </a>
        </div>
        <div className="md:contents">
          <Group title="Explore" items={EXPLORE} />
          <Group title="Legal" items={LEGAL} />
        </div>
      </div>
      <div className="bg-[#07122b]">
        <p className={cn(siteContainer, "flex flex-wrap items-center justify-between gap-2 py-5 text-[13px] text-white/60")}>
          <span>&copy; 2026 AquaSentinel. All rights reserved.</span>
          <span>Ngomano, Makueni County</span>
        </p>
      </div>
    </footer>
  );
}
