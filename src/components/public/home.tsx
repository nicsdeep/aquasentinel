import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CHALLENGE_SUMMARY, PILLARS, PILOT_STRIP } from "@/lib/site/content";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";
import { HeroDeck, type DeckImage } from "./hero-deck";
import { Eyebrow, SectionWaves } from "./page-kit";

/*
 * Homepage = a gateway, not a document (owner's approved references, 16 Nov 2026).
 * Phone: headline, one action, one quiet link, the pilot strip; the four destinations live in the menu. Laptop: the approved desktop hero,
 * pillars and challenge summary. Details live on their own pages.
 * The images are illustrative, not pictures of the Ngomano site.
 */

/** Illustrative images (not photographs of Ngomano). Order tells the §3.2 story: pumping to a pan, the pump, solar, people. */
const DECK: DeckImage[] = [
  { src: "/landing/deck/01.jpg", alt: "A worker beside an electric pump and pipeline that fills a lined water pan in a dry valley" },
  { src: "/landing/deck/02.jpg", alt: "A technician checking a pump beside a small pump house on a riverbank" },
  { src: "/landing/deck/03.jpg", alt: "A technician inspecting dusty solar panels near a pump house and an elevated water tank" },
  { src: "/landing/deck/04.jpg", alt: "A technician and community members examining a valve on a water pipe together" },
  { src: "/landing/deck/05.jpg", alt: "A worker setting up a portable pump in a river, with a hose running up to a water pan" },
  { src: "/landing/deck/06.jpg", alt: "A technician checking solar panels while a woman collects water near a raised tank" },
];

/** Flowing aqua wave used beneath the hero image. */
function AquaWave({ className, base = "#ffffff" }: { className?: string; base?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden>
      <path d="M0 34C70 16 130 22 200 40s140 26 200-6v56H0Z" fill="#a9e3f4" opacity="0.95" />
      <path d="M0 52C80 30 150 40 220 56s120 14 180-14v48H0Z" fill="#2cc3e6" opacity="0.6" />
      <path d="M0 66C90 48 170 58 240 70s110 8 160-12v32H0Z" fill={base} />
    </svg>
  );
}

/* ----------------------------------------------- Phone ---------------------------------------------------- */

function MobileHome() {
  return (
    <div className="md:hidden">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#eef8fc] to-[#e2f3fa]">
        <div className="relative z-10 px-6 pt-7">
          <h1 className="lp-heading text-[clamp(36px,10.2vw,43px)] leading-[0.98] tracking-[-0.005em] text-lp-ink">
            A smarter way to
            <br />
            manage community
            <br />
            <span className="relative inline-block">
              water.
              <svg className="absolute -bottom-2 left-0 h-3 w-[92%]" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 8C30 3 70 3 118 6" stroke="var(--color-lp-cyan)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-6 max-w-[15.5rem] text-[17px] leading-[1.4] text-lp-body">
            Monitor, respond and maintain water services for more reliable access.
          </p>
          <Link href="/approach" className="mt-6 inline-flex h-12 items-center gap-4 rounded-full bg-lp-blue-deep px-7 text-[17px] font-medium text-white shadow-[0_8px_20px_-10px_rgb(1_66_111/0.8)] active:brightness-110">
            See How It Works <ArrowRight className="size-5" aria-hidden />
          </Link>
          <div className="mt-5">
            <Link href="/challenge" className="inline-flex min-h-11 items-center text-[16px] font-medium text-lp-ink underline decoration-lp-cyan decoration-2 underline-offset-[7px]">
              Explore the Challenge
            </Link>
          </div>
        </div>
        {/* Images in their own band below the text: nothing overlaps the words */}
        <div className="relative z-10 px-6 pb-24 pt-9">
          <HeroDeck images={DECK} sizes="(max-width: 767px) 90vw, 1px" priority />
        </div>
        <AquaWave className="absolute inset-x-0 bottom-0 h-[4.5rem] w-full" base="#0b2c5c" />
      </section>


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

function DesktopWave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path d="M0 40C200 20 340 34 520 54s420 30 620 0 260-38 300-30V120H0Z" fill="var(--color-lp-wave)" opacity="0.75" />
      <path d="M0 70C220 46 380 56 560 72s400 26 600 2 240-36 280-30V120H0Z" fill="var(--color-lp-band)" />
    </svg>
  );
}

function DesktopHome() {
  return (
    <div className="hidden md:block">
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f3f9fc]">
        {/* Two columns with a fixed gap: text never sits on imagery */}
        <div className={cn(siteContainer, "relative z-10 grid items-center gap-x-16 gap-y-10 pb-32 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:pb-28 lg:pt-12")}>
          <div className="max-w-[790px]">
            <Eyebrow>IFSL Water Scarcity Challenge</Eyebrow>
            <h1 className="lp-heading mt-4 text-[clamp(44px,4.2vw,72px)] leading-[0.95] tracking-[-0.01em] text-lp-ink">
              A smarter way to <br />
              manage community <br className="xl:hidden" />
              water.
            </h1>
            <p className="mt-4 max-w-[560px] text-[clamp(17px,1.2vw,19.5px)] leading-[1.5] text-lp-body">
              AquaSentinel is a proposed solution to help communities like Ngomano monitor water infrastructure, respond to
              problems and organise maintenance for more reliable water access.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <Link href="/approach" className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-gradient-to-b from-[#0b6d9b] to-lp-blue px-7 text-[17px] font-medium text-white shadow-[0_6px_16px_-8px_rgb(1_80_124/0.7)] transition hover:brightness-110">
                See Our Approach <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link href="/challenge" className="inline-flex h-[52px] items-center rounded-xl border-[1.5px] border-lp-ink bg-white px-7 text-[17px] font-medium text-lp-ink transition hover:bg-lp-pill">
                The Challenge
              </Link>
            </div>
          </div>
          <HeroDeck images={DECK} sizes="(min-width: 1024px) 45vw, (min-width: 768px) 90vw, 1px" className="lg:pr-6" />
        </div>
        <DesktopWave className="absolute inset-x-0 bottom-0 h-24 w-full" />
      </section>

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
            <Eyebrow>The Challenge</Eyebrow>
            <h2 className="lp-heading mt-5 text-[clamp(40px,3.9vw,65px)] leading-[1.02] tracking-[-0.01em] text-lp-ink">Water challenges in Ngomano</h2>
            <p className="mt-5 text-[clamp(17px,1.2vw,19.5px)] leading-[1.5] text-lp-body">{CHALLENGE_SUMMARY}</p>
            <Link href="/challenge" className="mt-6 inline-flex items-center gap-2 text-[17px] font-medium text-lp-blue hover:underline">
              Read the full challenge <ArrowRight className="size-4" aria-hidden />
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
