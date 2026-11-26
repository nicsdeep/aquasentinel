import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CHALLENGE_SUMMARY, PILLARS, PILOT_STRIP } from "@/lib/site/content";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";
import { VideoHero } from "./video-hero";
import { Eyebrow, SectionWaves } from "./page-kit";

/*
 * Homepage = a gateway, not a document. The hero is the owner's recorded River Athi footage (26 Nov 2026).
 * Phone: video hero, then the pilot strip; the destinations live in the menu. Laptop: video hero, the four
 * principles band and the problem summary. Details live on their own pages.
 */

/* ----------------------------------------------- Phone ---------------------------------------------------- */

function MobileHome() {
  return (
    <div className="md:hidden">
      <VideoHero waveTo="navy" />

      <Link href="/pilot" className="group relative block bg-gradient-to-b from-[#0b2c5c] to-lp-ink pb-8 pt-4 text-white">
        <span className="flex items-center gap-4 px-5">
          <MapPin className="size-9 shrink-0 fill-lp-cyan text-lp-cyan [&>circle]:fill-[#0b2c5c] [&>circle]:stroke-[#0b2c5c]" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[17.5px] font-semibold">{PILOT_STRIP.place}</span>
            <span className="mt-0.5 block text-[13.5px] leading-snug text-white/85">{PILOT_STRIP.text}</span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/12 transition group-active:bg-white/20">
            <ArrowRight className="size-5" aria-hidden />
            <span className="sr-only">Open the pilot page</span>
          </span>
        </span>
      </Link>
    </div>
  );
}

/* ----------------------------------------------- Laptop ---------------------------------------------------- */

function DesktopHome() {
  return (
    <div className="hidden md:block">
      <VideoHero />

      <section className="bg-lp-band" aria-label="What AquaSentinel does">
        <ul className={cn(siteContainer, "grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4 lg:py-6")}>
          {PILLARS.map(({ icon: Icon, title, text, width }, i) => (
            <li key={title} className={cn("flex gap-5 lg:px-8", i > 0 && "lg:border-l lg:border-[#dfe7ee]", i === 0 && "lg:pl-7")}>
              <Icon className="mt-1 size-10 shrink-0 text-lp-cyan" strokeWidth={1.5} aria-hidden />
              <div>
                <h2 className="lp-heading text-[31px] leading-tight text-lp-ink">{title}</h2>
                <p className={cn("mt-1 text-[17px] leading-snug text-lp-body", width)}>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden bg-white">
        <SectionWaves />
        <div className={cn(siteContainer, "relative grid gap-10 pb-28 pt-12 md:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16")}>
          <div className="max-w-[760px]">
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="lp-heading mt-5 text-[clamp(40px,3.9vw,65px)] leading-[1.02] tracking-[-0.01em] text-lp-ink">Water problems in Ngomano</h2>
            <p className="mt-5 text-[clamp(17px,1.2vw,19.5px)] leading-[1.5] text-lp-body">{CHALLENGE_SUMMARY}</p>
            <Link href="/challenge" className="mt-6 inline-flex items-center gap-2 text-[17px] font-medium text-lp-blue hover:underline">
              Read more about the problem <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Link href="/pilot" className="flex flex-col items-start gap-4 lg:items-center lg:pr-24">
            <span className="inline-flex items-center gap-4 rounded-full bg-lp-pill px-9 py-4 text-[19px] font-semibold text-lp-ink transition hover:brightness-95">
              <MapPin className="size-6 fill-lp-cyan text-lp-cyan [&>circle]:fill-white [&>circle]:stroke-white" aria-hidden />
              Ngomano
              <span className="h-6 w-px bg-lp-ink/30" aria-hidden />
              <span className="font-medium">Makueni County</span>
            </span>
            <span className="text-[16px] text-lp-body">{PILOT_STRIP.text}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function Home() {
  return (
    <>
      <MobileHome />
      <DesktopHome />
    </>
  );
}
