import { BatteryMedium, Droplets, Gauge, Power, Sun, type LucideIcon } from "lucide-react";
import type { Tone } from "@/lib/status";
import type { LatestReading, Metric } from "@/lib/data/types";

export interface ReadingView {
  metric: Metric;
  label: string;
  icon: LucideIcon;
  value: string;
  unit: string;
  state: string;
  tone: Tone;
  explanation: string;
}

/** Display order on the dashboard: pumping first, then what the community gets, then power. */
export const METRIC_ORDER: Metric[] = ["pump_running", "flow_rate", "tank_level", "solar_power", "battery_voltage"];

const fmt = (v: number, digits = 1) => v.toFixed(digits);

/**
 * Turns a raw reading into plain language for a non-technical operator (PROJECT_RULES §6):
 * a value with its unit, a one-word state, and what it means.
 */
export function describeReading(r: LatestReading, all: LatestReading[], localHour: number): ReadingView {
  const pumpOn = all.find((x) => x.metric === "pump_running")?.value === 1;
  switch (r.metric) {
    case "pump_running":
      return {
        metric: r.metric, label: "Pump", icon: Power, value: r.value === 1 ? "Running" : "Stopped", unit: "",
        state: r.value === 1 ? "On" : "Off", tone: r.value === 1 ? "ok" : "off",
        explanation: r.value === 1 ? "The river intake pump reports that it is running." : "The pump is not running (normal at night for a solar pump).",
      };
    case "flow_rate": {
      const noFlow = pumpOn && r.value < 0.5;
      const reduced = pumpOn && r.value >= 0.5 && r.value < 8;
      return {
        metric: r.metric, label: "Water flow", icon: Gauge, value: fmt(r.value), unit: "m³/h",
        state: !pumpOn ? "Pump off" : noFlow ? "No flow" : reduced ? "Reduced" : "Normal",
        tone: !pumpOn ? "off" : noFlow ? "crit" : reduced ? "warn" : "ok",
        explanation: noFlow
          ? "The pump is running but no water is moving."
          : reduced ? "Less water is moving than expected. Possible leak or blockage." : "Water moving through the pipeline to storage.",
      };
    }
    case "tank_level": {
      const low = r.value < 20;
      return {
        metric: r.metric, label: "Storage level", icon: Droplets, value: fmt(r.value, 0), unit: "%",
        state: low ? "Low" : "Normal", tone: low ? "warn" : "ok",
        explanation: low ? "Little water left in storage." : "How full the storage pan is.",
      };
    }
    case "solar_power": {
      const daylight = localHour >= 9 && localHour < 16;
      const low = daylight && r.value < 0.4;
      const dark = r.value === 0 && !daylight;
      return {
        metric: r.metric, label: "Solar power", icon: Sun, value: fmt(r.value, 2), unit: "kW",
        state: low ? "Low" : dark ? "No sun" : "Generating", tone: low ? "warn" : dark ? "off" : "ok",
        explanation: low ? "Little power from the panels during daylight." : "Power from the solar panels that run the pump.",
      };
    }
    case "battery_voltage": {
      const low = r.value < 22.5;
      return {
        metric: r.metric, label: "Battery", icon: BatteryMedium, value: fmt(r.value), unit: "V",
        state: low ? "Low" : "OK", tone: low ? "warn" : "ok",
        explanation: "Battery that powers the controller and monitoring unit.",
      };
    }
  }
}

/** Local hour (0–23) in the site's time zone. */
export function localHour(timeZone: string, at: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hour12: false }).format(at)) % 24;
}
