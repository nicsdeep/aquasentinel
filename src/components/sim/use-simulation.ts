"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initialState, step, type SimState } from "@/lib/sim/engine";

export type Speed = 1 | 60 | 300;

/**
 * Runs the simulation engine in the browser: one authoritative state, advanced ~20 times per second by
 * requestAnimationFrame (paused while the tab is hidden). `speed` multiplies simulated time, so a long refill can be
 * shown in seconds; the formulas stay exact and the page shows simulated elapsed time.
 */
export function useSimulation() {
  const [state, setState] = useState<SimState>(initialState);
  const [speed, setSpeed] = useState<Speed>(60);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt;
      if (acc >= 0.05 && !document.hidden) {
        const simSeconds = acc * speedRef.current;
        acc = 0;
        setState((s) => {
          // Small engine steps keep thresholds exact even at high speed.
          let next = s;
          let left = simSeconds;
          while (left > 0) {
            const d = Math.min(5, left);
            next = step(next, d);
            left -= d;
          }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const act = useCallback((fn: (s: SimState) => SimState) => setState(fn), []);
  return { state, act, speed, setSpeed };
}
