"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { siteContainer } from "./layout";

/*
 * Homepage hero: the owner's own recorded footage of the River Athi fills the hero (owner's brief, 26 Nov 2026).
 * Muted, looping, inline, no controls. Reduced-motion users and browsers that refuse autoplay see the first frame
 * as a still poster. The text sits on a soft navy fade on the left so the river stays visible on the right.
 */

const VIDEO = "/landing/river-athi.mp4";
const POSTER = "/landing/river-athi-poster.jpg";

/** Wave that carries the hero into the band below (same water-theme waves as before). */
function HeroWave({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
      <path d="M0 52C200 30 340 44 520 62s420 30 620 0 260-38 300-30V120H0Z" fill="var(--color-lp-wave)" opacity="0.8" />
      <path d="M0 78C220 56 380 64 560 80s400 26 600 2 240-36 280-30V120H0Z" fill="var(--color-lp-band)" />
    </svg>
  );
}

export function VideoHero({ waveTo = "band" }: { waveTo?: "band" | "navy" }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (reduce.matches) {
        v.pause();
        v.currentTime = 0;
      } else {
        // If the browser refuses autoplay, the poster simply stays: nothing breaks.
        void v.play().catch(() => {});
      }
    };
    apply();
    reduce.addEventListener("change", apply);
    return () => reduce.removeEventListener("change", apply);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-lp-ink" aria-label="AquaSentinel">
      <video
        ref={ref}
        className="absolute inset-0 -z-10 size-full object-cover object-[62%_center] md:object-center"
        src={VIDEO}
        poster={POSTER}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
        data-testid="hero-video"
      />
      {/* Readability: navy fade from the left (laptop) or from the bottom (phone); the river stays visible */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-lp-ink/90 via-lp-ink/45 to-lp-ink/10 md:bg-gradient-to-r md:from-lp-ink/85 md:via-lp-ink/40 md:to-transparent" aria-hidden />

      <div className={cn(siteContainer, "relative flex min-h-[min(72svh,640px)] flex-col justify-end pb-24 pt-20 md:min-h-[min(78vh,760px)] md:justify-center md:pb-36 md:pt-16")}>
        <div className="max-w-[640px] text-white">
          <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/90 md:text-[15px]">
            <MapPin className="size-5 fill-lp-cyan text-lp-cyan [&>circle]:fill-lp-ink [&>circle]:stroke-lp-ink" aria-hidden />
            Ngomano, Makueni County
            <span className="ml-3 hidden h-px w-14 bg-white/70 md:inline-block" aria-hidden />
          </p>
          <h1 className="lp-heading mt-4 text-[clamp(38px,5vw,74px)] leading-[0.98] tracking-[-0.01em] text-white [text-shadow:0_2px_24px_rgb(12_26_58/0.35)]">
            A smarter way to manage community water.
          </h1>
          <p className="mt-4 max-w-[520px] text-[clamp(16px,1.25vw,20px)] leading-[1.5] text-white/90">
            AquaSentinel helps communities monitor water infrastructure, respond early, and keep water flowing.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 md:gap-5">
            <Link href="/approach" className="inline-flex h-12 items-center gap-3 rounded-xl bg-gradient-to-b from-[#0b6d9b] to-lp-blue px-6 text-[16px] font-medium text-white shadow-[0_8px_20px_-10px_rgb(0_0_0/0.6)] transition hover:brightness-110 md:h-[52px] md:px-7 md:text-[17px]">
              See Our Approach <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href="/demo/water-flow" className="inline-flex h-12 items-center rounded-xl border-[1.5px] border-white/85 bg-white/5 px-6 text-[16px] font-medium text-white backdrop-blur-[2px] transition hover:bg-white/15 md:h-[52px] md:px-7 md:text-[17px]">
              Explore Live Simulation
            </Link>
          </div>
        </div>
        <p className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-lp-ink/55 px-3 py-1.5 text-[12px] text-white/90 backdrop-blur-sm md:bottom-28 md:right-8 md:top-auto md:text-[13px]">
          <Video className="size-4" aria-hidden /> River Athi · Recorded footage
        </p>
      </div>

      {waveTo === "band" ? (
        <HeroWave className="absolute inset-x-0 bottom-0 h-16 w-full md:h-24" />
      ) : (
        <svg className="absolute inset-x-0 bottom-0 h-14 w-full" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden>
          <path d="M0 52C80 30 150 40 220 56s120 14 180-14v48H0Z" fill="#2cc3e6" opacity="0.55" />
          <path d="M0 66C90 48 170 58 240 70s110 8 160-12v32H0Z" fill="#0b2c5c" />
        </svg>
      )}
    </section>
  );
}
