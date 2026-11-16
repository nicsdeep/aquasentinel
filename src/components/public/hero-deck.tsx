"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DeckImage {
  src: string;
  alt: string;
}

/**
 * 3D card swipe deck for the homepage (owner decision, 16 Nov 2026).
 * The front card sits on top of two tilted cards behind it. Swipe or drag the front card to send it to the back;
 * it also advances every 6 s, pausing while touched, hovered, focused or when the tab is hidden.
 * People who prefer reduced motion get no auto-advance and no tilt. Images are illustrative.
 */
export function HeroDeck({ images, className, sizes, priority = false }: { images: DeckImage[]; className?: string; sizes: string; priority?: boolean }) {
  const n = images.length;
  const [front, setFront] = useState(0);
  const [drag, setDrag] = useState(0);
  const [flinging, setFlinging] = useState<0 | 1 | -1>(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announce, setAnnounce] = useState("");
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // Set when a person changes the image, so only manual changes are announced to screen readers.
  const announceNext = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (reduced) {
        setFront((f) => (f + dir + n) % n);
        return;
      }
      setFlinging(dir);
      window.setTimeout(() => {
        setFront((f) => (f + dir + n) % n);
        setFlinging(0);
        setDrag(0);
      }, 320);
    },
    [n, reduced],
  );

  useEffect(() => {
    if (!announceNext.current) return;
    announceNext.current = false;
    setAnnounce(`Image ${front + 1} of ${n}: ${images[front].alt}`);
  }, [front, n, images]);

  // Auto-advance (not for reduced motion, not while paused or hidden).
  useEffect(() => {
    if (reduced || paused || n < 2) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") go(1);
    }, 6000);
    return () => window.clearInterval(t);
  }, [reduced, paused, n, go]);

  const manual = (dir: 1 | -1) => {
    announceNext.current = true;
    go(dir);
  };

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    setPaused(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > Math.abs(e.clientY - s.y) && Math.abs(dx) > 6) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      setDrag(dx);
    }
  }
  function onPointerUp() {
    const dx = drag;
    start.current = null;
    if (Math.abs(dx) >= 50) manual(dx < 0 ? 1 : -1);
    else setDrag(0);
    setPaused(false);
  }

  const card = (offset: number) => {
    // offset 0 = front, 1 and 2 = behind
    if (reduced) return { transform: "none", opacity: offset === 0 ? 1 : 0, zIndex: 10 - offset };
    if (offset === 0) {
      const x = flinging ? `${flinging * -120}%` : `${drag}px`;
      const rot = flinging ? flinging * -14 : drag / 18;
      return { transform: `translateX(${x}) rotateY(${rot}deg) rotateZ(${rot / 4}deg)`, opacity: flinging ? 0 : 1, zIndex: 10 };
    }
    const s = offset === 1 ? 0.94 : 0.88;
    return {
      transform: `translate3d(${offset * 7}%, ${-offset * 4}%, ${-offset * 50}px) rotateY(${-offset * 5}deg) scale(${s})`,
      opacity: offset === 1 ? 0.85 : 0.55,
      zIndex: 10 - offset,
    };
  };

  return (
    <div
      ref={root}
      className={cn("relative select-none", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Water infrastructure images"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); manual(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); manual(-1); }
      }}
    >
      <div className="relative mr-[8%] mt-[4%] aspect-[16/10] [perspective:1200px]">
        {[2, 1, 0].map((offset) => {
          const i = (front + offset) % n;
          const style = card(offset);
          return (
            <div
              key={`${i}-${offset}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${i + 1} of ${n}`}
              aria-hidden={offset !== 0}
              onPointerDown={offset === 0 ? onPointerDown : undefined}
              onPointerMove={offset === 0 ? onPointerMove : undefined}
              onPointerUp={offset === 0 ? onPointerUp : undefined}
              onPointerCancel={offset === 0 ? onPointerUp : undefined}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-3xl bg-lp-pill shadow-[0_24px_50px_-24px_rgb(12_26_58/0.55)] ring-1 ring-white/70 [transform-style:preserve-3d]",
                offset === 0 && "cursor-grab touch-pan-y active:cursor-grabbing",
                drag === 0 || offset !== 0 ? "transition-[transform,opacity] duration-300 ease-out" : "",
              )}
              style={style}
            >
              <Image
                src={images[i].src}
                alt={offset === 0 ? images[i].alt : ""}
                fill
                draggable={false}
                priority={priority && offset === 0 && front === 0}
                sizes={sizes}
                className="pointer-events-none object-cover"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose image">
          {images.map((img, i) => (
            <button
              key={img.src}
              role="tab"
              aria-selected={i === front}
              aria-label={`Show image ${i + 1} of ${n}`}
              onClick={() => { announceNext.current = true; setFront(i); }}
              className="grid h-6 place-items-center px-0.5"
            >
              <span className={cn("block h-1.5 rounded-full transition-all", i === front ? "w-6 bg-lp-blue-deep" : "w-1.5 bg-lp-blue-deep/25")} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[12px] text-lp-body/80">Illustrative images</span>
          <button onClick={() => manual(-1)} aria-label="Previous image" className="grid size-10 place-items-center rounded-full border border-[#d6e6ee] bg-white text-lp-ink hover:bg-lp-pill">
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button onClick={() => manual(1)} aria-label="Next image" className="grid size-10 place-items-center rounded-full border border-[#d6e6ee] bg-white text-lp-ink hover:bg-lp-pill">
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
