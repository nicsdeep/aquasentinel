import { describe, expect, it } from "vitest";
import {
  confirmStart, failSolar, initialState, pumpFault, repairLeak, reset, restoreNormal, restoreSolar, setAutoConfirm,
  setConsumption, setMode, setPump, setSourceLow, setTankPct, startLeak, step, tankPct, type SimState,
} from "@/lib/sim/engine";

/** Runs the engine for `minutes` of simulated time in 1-second steps. */
function run(s: SimState, minutes: number): SimState {
  for (let i = 0; i < minutes * 60; i++) s = step(s, 1);
  return s;
}

describe("manual pump control", () => {
  it("pump ON gives rated flow; volume equals flow × time", () => {
    let s = setPump(initialState(), true);
    expect(s.pumpRunning).toBe(true);
    expect(s.flowLpm).toBe(200);
    s = run(s, 10);
    expect(s.meterL).toBeCloseTo(2000, 6);
    expect(s.deliveredL).toBeCloseTo(2000, 6);
  });

  it("tank level rises by net volume ÷ capacity, gradually", () => {
    const start = initialState();
    const one = step(setPump(start, true), 60);
    expect(tankPct(one) - tankPct(start)).toBeCloseTo((200 / 50_000) * 100, 6);
  });

  it("pump OFF: no flow and the meter reading is unchanged", () => {
    let s = run(setPump(initialState(), true), 5);
    const meter = s.meterL;
    s = run(setPump(s, false), 5);
    expect(s.flowLpm).toBe(0);
    expect(s.meterL).toBe(meter);
  });
});

describe("consumption", () => {
  it("lowers the tank by consumption × time when the pump is off", () => {
    const s0 = initialState();
    const s = run(setConsumption(s0, true), 10);
    expect(s0.tankL - s.tankL).toBeCloseTo(1000, 6);
  });

  it("net change accounts for inflow minus consumption", () => {
    const s = run(setConsumption(setPump(initialState(), true), true), 10);
    expect(s.tankL - initialState().tankL).toBeCloseTo((200 - 100) * 10, 6);
  });

  it("never goes below empty", () => {
    const s = run(setConsumption(setTankPct(initialState(), 0.1), true), 10);
    expect(s.tankL).toBe(0);
  });
});

describe("automatic mode (AquaSentinel requests, controller acts)", () => {
  it("sends a start request at the low threshold and waits for confirmation", () => {
    let s = setAutoConfirm(setMode(setTankPct(initialState(), 24), "auto"), false);
    s = step(s, 1);
    expect(s.startRequested).toBe(true);
    expect(s.pumpRunning).toBe(false);
    expect(s.alerts[0].kind).toBe("low_level");
    s = confirmStart(s);
    expect(s.pumpRunning).toBe(true);
  });

  it("with auto-confirm, refills from low to high and stops, without chattering", () => {
    let s = setConsumption(setMode(setTankPct(initialState(), 30), "auto"), true);
    let starts = 0;
    let stops = 0;
    let was = s.pumpRunning;
    let maxPct = 0;
    for (let i = 0; i < 12 * 3600; i++) {
      s = step(s, 1);
      if (s.pumpRunning && !was) starts++;
      if (!s.pumpRunning && was) stops++;
      was = s.pumpRunning;
      maxPct = Math.max(maxPct, tankPct(s));
    }
    expect(starts).toBeGreaterThanOrEqual(1);
    expect(stops).toBeGreaterThanOrEqual(1);
    expect(maxPct).toBeGreaterThanOrEqual(95);
    expect(maxPct).toBeLessThan(95.2);
    // One start per low→high cycle: cycles are long, never second-by-second switching.
    expect(starts).toBeLessThanOrEqual(stops + 1);
    expect(starts).toBeLessThan(10);
  });

  it("does not start while the level is between the thresholds", () => {
    const s = run(setMode(setTankPct(initialState(), 50), "auto"), 5);
    expect(s.pumpRunning).toBe(false);
    expect(s.startRequested).toBe(false);
  });
});

describe("faults", () => {
  it("solar failure stops pumping and raises an alert; restore resumes", () => {
    let s = failSolar(setPump(initialState(), true));
    expect(s.pumpRunning).toBe(false);
    expect(s.flowLpm).toBe(0);
    expect(s.alerts.some((a) => a.kind === "power")).toBe(true);
    s = restoreSolar(s);
    expect(s.pumpRunning).toBe(true);
  });

  it("a leak: the meter keeps the full flow, the tank gets less, a possible leak is flagged", () => {
    let s = startLeak(setPump(initialState(), true));
    s = run(s, 10);
    expect(s.meterL).toBeCloseTo(2000, 6);
    expect(s.deliveredL).toBeCloseTo(1400, 6);
    expect(s.leakLostL).toBeCloseTo(600, 6);
    expect(s.alerts[0].text).toMatch(/Possible/);
    s = repairLeak(s);
    expect(s.inflowLpm).toBe(200);
  });

  it("pump fault and low river level block pumping", () => {
    expect(pumpFault(setPump(initialState(), true)).pumpRunning).toBe(false);
    expect(setSourceLow(setPump(initialState(), true), true).pumpRunning).toBe(false);
  });

  it("restore normal clears faults and alerts", () => {
    const s = restoreNormal(startLeak(failSolar(pumpFault(setPump(initialState(), true)))));
    expect(s.pumpRunning).toBe(true);
    expect(s.alerts).toHaveLength(0);
  });
});

describe("determinism and reset", () => {
  it("same inputs give the same outputs", () => {
    const a = run(setConsumption(setPump(initialState(), true), true), 7);
    const b = run(setConsumption(setPump(initialState(), true), true), 7);
    expect(a).toEqual(b);
  });

  it("reset restores the initial state", () => {
    const s = reset(run(startLeak(setPump(initialState(), true)), 3));
    expect(s).toEqual(initialState());
  });
});
