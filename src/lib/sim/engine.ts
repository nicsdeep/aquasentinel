/**
 * Water-flow simulation engine (frontend only, deterministic, one authoritative state).
 *
 * River Athi → intake → pump → smart meter → distribution pipe → storage tank.
 * Every number and every animation on the simulation page comes from this state. Nothing here talks to real
 * equipment, the database or production telemetry.
 *
 * AquaSentinel never controls the pump: in automatic mode it detects a low tank and sends a *start request* to the
 * (simulated) local pump controller, which starts the pump once the operator confirms (or auto-confirm is on).
 * The controller also stops the pump at the high threshold.
 */

export type Mode = "manual" | "auto";
export type AlertKind = "low_level" | "tank_full" | "power" | "leak" | "pump_fault" | "source_low" | "start_request";

export interface SimAlert {
  id: number;
  kind: AlertKind;
  text: string;
  /** Simulated time in seconds when it was raised. */
  at: number;
}

export interface SimConfig {
  /** Storage capacity in litres. */
  capacityL: number;
  /** Pump flow when running, in L/min (200 L/min = 12 m³/h). */
  ratedFlowLpm: number;
  /** Share of metered water lost at the leak, downstream of the meter (0..1). */
  leakFraction: number;
  /** Community water use when consumption is on, in L/min. */
  consumptionLpm: number;
  /** Pumping is blocked below this river level (%). */
  minSourcePct: number;
}

export interface SimState {
  config: SimConfig;
  /** Simulated time, seconds since start or reset. */
  t: number;
  mode: Mode;
  /** Operator's ON/OFF choice in manual mode; controller command in auto mode. */
  pumpCommand: boolean;
  /** True only when the pump is actually turning (command and all conditions met). */
  pumpRunning: boolean;
  pumpFault: boolean;
  solarOk: boolean;
  leak: boolean;
  sourcePct: number;
  consumption: boolean;
  lowPct: number;
  highPct: number;
  autoConfirm: boolean;
  /** AquaSentinel has asked the controller to start the pump and is waiting for confirmation. */
  startRequested: boolean;
  tankL: number;
  /** Smart meter cumulative reading, litres (upstream of any leak). */
  meterL: number;
  /** Water that actually reached the tank, litres. */
  deliveredL: number;
  leakLostL: number;
  usedL: number;
  /** Instantaneous values, L/min. */
  flowLpm: number;
  inflowLpm: number;
  outflowLpm: number;
  alerts: SimAlert[];
  nextAlertId: number;
}

export const DEFAULT_CONFIG: SimConfig = {
  capacityL: 50_000,
  ratedFlowLpm: 200,
  leakFraction: 0.3,
  consumptionLpm: 100,
  minSourcePct: 20,
};

export const MAX_ALERTS = 8;

export function initialState(config: SimConfig = DEFAULT_CONFIG): SimState {
  return {
    config,
    t: 0,
    mode: "manual",
    pumpCommand: false,
    pumpRunning: false,
    pumpFault: false,
    solarOk: true,
    leak: false,
    sourcePct: 80,
    consumption: false,
    lowPct: 25,
    highPct: 95,
    autoConfirm: true,
    startRequested: false,
    tankL: config.capacityL * 0.4,
    meterL: 0,
    deliveredL: 0,
    leakLostL: 0,
    usedL: 0,
    flowLpm: 0,
    inflowLpm: 0,
    outflowLpm: 0,
    alerts: [],
    nextAlertId: 1,
  };
}

export const tankPct = (s: SimState) => (s.tankL / s.config.capacityL) * 100;

function alert(s: SimState, kind: AlertKind, text: string): SimState {
  const alerts = [{ id: s.nextAlertId, kind, text, at: s.t }, ...s.alerts].slice(0, MAX_ALERTS);
  return { ...s, alerts, nextAlertId: s.nextAlertId + 1 };
}

const clearAlerts = (s: SimState, kind: AlertKind): SimState => ({ ...s, alerts: s.alerts.filter((a) => a.kind !== kind) });

/** Why the pump cannot run right now, or null when it can. */
export function blocker(s: SimState): "fault" | "power" | "source" | null {
  if (s.pumpFault) return "fault";
  if (!s.solarOk) return "power";
  if (s.sourcePct < s.config.minSourcePct) return "source";
  return null;
}

/** Recomputes instantaneous flows from the current state (no time passes). */
function settle(s: SimState): SimState {
  const running = s.pumpCommand && blocker(s) === null;
  const flowLpm = running ? s.config.ratedFlowLpm : 0;
  const inflowLpm = flowLpm * (s.leak ? 1 - s.config.leakFraction : 1);
  const outflowLpm = s.consumption && s.tankL > 0 ? s.config.consumptionLpm : 0;
  return { ...s, pumpRunning: running, flowLpm, inflowLpm, outflowLpm };
}

/**
 * Advances the simulation by `dtSeconds` of simulated time. Pure: same state + same dt gives the same result.
 * Volume added (L) = flow (L/min) × elapsed (min). Tank change = (inflow − consumption) × elapsed, kept within 0..capacity.
 */
export function step(prev: SimState, dtSeconds: number): SimState {
  if (dtSeconds <= 0) return prev;
  let s = { ...prev };

  // Automatic mode: AquaSentinel watches the level; the local controller acts (with hysteresis).
  if (s.mode === "auto") {
    const pct = tankPct(s);
    if (!s.pumpCommand && !s.startRequested && pct <= s.lowPct) {
      s = alert(s, "low_level", `Low water level detected (${pct.toFixed(0)} %). Start request sent to the pump controller.`);
      s.startRequested = true;
    }
    if (s.startRequested && s.autoConfirm) {
      s = { ...s, startRequested: false, pumpCommand: true };
    }
    if (s.pumpCommand && pct >= s.highPct) {
      s = alert(s, "tank_full", `Tank reached ${s.highPct} %. The controller stopped the pump.`);
      s.pumpCommand = false;
    }
  }

  s = settle(s);
  const minutes = dtSeconds / 60;
  const inL = s.inflowLpm * minutes;
  const usedL = Math.min(s.outflowLpm * minutes, s.tankL + inL);
  const tankL = Math.min(s.config.capacityL, Math.max(0, s.tankL + inL - usedL));
  const meterAdd = s.flowLpm * minutes;
  s = {
    ...s,
    t: s.t + dtSeconds,
    tankL,
    meterL: s.meterL + meterAdd,
    deliveredL: s.deliveredL + inL,
    leakLostL: s.leakLostL + (meterAdd - inL),
    usedL: s.usedL + usedL,
  };
  return settle(s);
}

/* ---------------------------------------------------------------------------------------------------------- */
/* Actions (pure)                                                                                               */
/* ---------------------------------------------------------------------------------------------------------- */

export function setPump(s: SimState, on: boolean): SimState {
  if (s.mode !== "manual") return s;
  let next: SimState = { ...s, pumpCommand: on };
  const b = blocker(next);
  if (on && b === "power") next = alert(next, "power", "Solar power unavailable: the pump cannot start.");
  if (on && b === "source") next = alert(next, "source_low", "River level below the safe minimum: pumping is blocked.");
  if (on && b === "fault") next = alert(next, "pump_fault", "Pump fault: the pump cannot start until it is inspected.");
  return settle(next);
}

export function setMode(s: SimState, mode: Mode): SimState {
  // Switching modes hands control over cleanly: the pump stops and the controller re-evaluates the level.
  return settle({ ...s, mode, pumpCommand: false, startRequested: false });
}

export function setThresholds(s: SimState, lowPct: number, highPct: number): SimState {
  const low = Math.max(5, Math.min(80, Math.round(lowPct)));
  const high = Math.max(low + 10, Math.min(100, Math.round(highPct)));
  return { ...s, lowPct: low, highPct: high };
}

export const setAutoConfirm = (s: SimState, on: boolean): SimState => ({ ...s, autoConfirm: on });

export function confirmStart(s: SimState): SimState {
  if (!s.startRequested) return s;
  return settle({ ...s, startRequested: false, pumpCommand: true });
}

export const setConsumption = (s: SimState, on: boolean): SimState => settle({ ...s, consumption: on });

export function failSolar(s: SimState): SimState {
  return settle(alert({ ...s, solarOk: false }, "power", "Solar power failure: no power to the pump, pumping has stopped."));
}
export const restoreSolar = (s: SimState): SimState => settle(clearAlerts({ ...s, solarOk: true }, "power"));

export function startLeak(s: SimState): SimState {
  return settle(alert({ ...s, leak: true }, "leak", "Possible pipeline leak: less water is reaching the tank than the meter recorded. Inspection needed."));
}
export const repairLeak = (s: SimState): SimState => settle(clearAlerts({ ...s, leak: false }, "leak"));

export function pumpFault(s: SimState): SimState {
  return settle(alert({ ...s, pumpFault: true }, "pump_fault", "Pump fault detected: pumping stopped. Simulated incident opened for inspection."));
}
export const clearFault = (s: SimState): SimState => settle(clearAlerts({ ...s, pumpFault: false }, "pump_fault"));

export function setSourceLow(s: SimState, low: boolean): SimState {
  if (low) return settle(alert({ ...s, sourcePct: 12 }, "source_low", "River level below the safe minimum: pumping is blocked to protect the pump."));
  return settle(clearAlerts({ ...s, sourcePct: 80 }, "source_low"));
}

/** Clears every fault and returns to normal operation; levels, meter and mode are kept. */
export function restoreNormal(s: SimState): SimState {
  return settle({ ...s, pumpFault: false, solarOk: true, leak: false, sourcePct: 80, alerts: [] });
}

export const reset = (s: SimState): SimState => initialState(s.config);

/** Sets the tank level directly (used by the guided demo to save time). */
export function setTankPct(s: SimState, pct: number): SimState {
  return settle({ ...s, tankL: (Math.max(0, Math.min(100, pct)) / 100) * s.config.capacityL });
}
