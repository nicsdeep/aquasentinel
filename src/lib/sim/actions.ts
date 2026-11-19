/**
 * Serialisable simulation actions, so any screen can ask the one running engine to change something.
 * Screens send these over the shared real-time channel; the leading screen applies them with `applyAction`.
 */
import {
  clearFault, confirmStart, failSolar, pumpFault, repairLeak, reset, restoreNormal, restoreSolar, setAutoConfirm,
  setConsumption, setMode, setPump, setSourceLow, setTankPct, setThresholds, startLeak, type Mode, type SimState,
} from "./engine";

export type Speed = 1 | 60 | 300;

export type SimAction =
  | { kind: "setPump"; on: boolean }
  | { kind: "setMode"; mode: Mode }
  | { kind: "setThresholds"; low: number; high: number }
  | { kind: "setAutoConfirm"; on: boolean }
  | { kind: "confirmStart" }
  | { kind: "setConsumption"; on: boolean }
  | { kind: "failSolar" }
  | { kind: "restoreSolar" }
  | { kind: "startLeak" }
  | { kind: "repairLeak" }
  | { kind: "pumpFault" }
  | { kind: "clearFault" }
  | { kind: "setSourceLow"; low: boolean }
  | { kind: "restoreNormal" }
  | { kind: "reset" }
  | { kind: "setTankPct"; pct: number }
  | { kind: "setSpeed"; speed: Speed };

/** The shared simulation: engine state plus the presentation speed every screen follows. */
export interface Shared {
  state: SimState;
  speed: Speed;
}

export function applyAction(shared: Shared, a: SimAction): Shared {
  const s = shared.state;
  const next = (state: SimState): Shared => ({ ...shared, state });
  switch (a.kind) {
    case "setPump": return next(setPump(s, a.on));
    case "setMode": return next(setMode(s, a.mode));
    case "setThresholds": return next(setThresholds(s, a.low, a.high));
    case "setAutoConfirm": return next(setAutoConfirm(s, a.on));
    case "confirmStart": return next(confirmStart(s));
    case "setConsumption": return next(setConsumption(s, a.on));
    case "failSolar": return next(failSolar(s));
    case "restoreSolar": return next(restoreSolar(s));
    case "startLeak": return next(startLeak(s));
    case "repairLeak": return next(repairLeak(s));
    case "pumpFault": return next(pumpFault(s));
    case "clearFault": return next(clearFault(s));
    case "setSourceLow": return next(setSourceLow(s, a.low));
    case "restoreNormal": return next(restoreNormal(s));
    case "reset": return next(reset(s));
    case "setTankPct": return next(setTankPct(s, a.pct));
    case "setSpeed": return { ...shared, speed: a.speed };
  }
}

export interface Member {
  id: string;
  joinedAt: number;
}

/** The screen that runs the engine: the one that joined first (ties broken by id), so every screen agrees. */
export function electLeader(members: Member[]): string | null {
  if (members.length === 0) return null;
  return [...members].sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0].id;
}
