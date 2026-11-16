import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";

/** Building blocks for public content pages: the same type, colours and water details as the homepage. */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-5 text-[13px] font-bold uppercase tracking-[0.18em] text-lp-navy md:gap-6 md:text-[16.5px]", className)}>
      {children}
      <span className="h-[1.5px] w-10 bg-lp-navy md:w-14" aria-hidden />
    </p>
  );
}

export function SectionWaves({ className }: { className?: string }) {
  return (
    <svg className={cn("pointer-events-none absolute bottom-0 right-0 h-40 w-[70%] md:h-72 md:w-[60%]", className)} viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden>
      <path d="M0 260C180 200 360 230 520 170S760 60 800 40V300H0Z" fill="var(--color-lp-pill)" opacity="0.7" />
      <path d="M120 300C300 240 460 260 600 200S780 120 800 110V300Z" fill="var(--color-lp-wave)" opacity="0.6" />
    </svg>
  );
}

/** Page opening: eyebrow, serif title, one short lead, optional extra (e.g. the location pill). */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#eef8fc]">
      <SectionWaves />
      <div className={cn(siteContainer, "relative pb-12 pt-8 md:pb-20 md:pt-16")}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="lp-heading mt-4 max-w-[900px] text-[clamp(40px,5vw,72px)] leading-[1.0] tracking-[-0.01em] text-lp-ink">{title}</h1>
        <p className="mt-5 max-w-[680px] text-[clamp(17px,1.25vw,20px)] leading-[1.5] text-lp-body">{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** One subsection: a heading and short content, with a hairline above it. */
export function Block({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#e3edf2] py-10 first:border-t-0 md:py-14">
      <h2 className="lp-heading text-[clamp(30px,2.8vw,42px)] leading-[1.05] text-lp-ink">{title}</h2>
      <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-lp-body">{children}</div>
    </section>
  );
}

/** Page body column. */
export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className={cn(siteContainer, "max-w-[1100px] pb-6 md:pb-10")}>{children}</div>;
}

/** Steps as open rows (icon, serif title, text), the same style as the homepage pillars. No boxed cards. */
export function StepList({ items, numbered = false }: { items: { icon: LucideIcon; title: string; text: string }[]; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className="grid gap-x-12 gap-y-7 md:grid-cols-2">
      {items.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="flex gap-4">
          <Icon className="mt-1 size-9 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="lp-heading text-[26px] leading-tight text-lp-ink">
              {numbered && <span className="mr-2 text-lp-cyan">{i + 1}.</span>}
              {title}
            </h3>
            <p className="mt-1 text-[17px] leading-relaxed text-lp-body">{text}</p>
          </div>
        </li>
      ))}
    </List>
  );
}

/** Short bullet list with the cyan dash used across the site. */
export function Facts({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((d) => (
        <li key={d} className="flex gap-4">
          <span className="mt-3 h-[2px] w-5 shrink-0 bg-lp-cyan" aria-hidden />
          <span>{d}</span>
        </li>
      ))}
    </ul>
  );
}

/** Where to go next, so no page is a dead end. */
export function NextStep({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <div className={cn(siteContainer, "max-w-[1100px] pb-20 md:pb-28")}>
      <Link href={href} className="group flex items-center gap-5 rounded-2xl bg-lp-pill px-6 py-5 transition hover:brightness-[0.97]">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold uppercase tracking-[0.18em] text-lp-navy">Next</span>
          <span className="lp-heading mt-1 block text-[28px] leading-tight text-lp-ink">{label}</span>
          <span className="mt-1 block text-[15px] text-lp-body">{text}</span>
        </span>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-lp-blue-deep text-white transition group-hover:translate-x-0.5">
          <ArrowRight className="size-5" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
