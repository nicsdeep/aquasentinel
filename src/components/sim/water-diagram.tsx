"use client";

import type { SimState } from "@/lib/sim/engine";
import { tankPct } from "@/lib/sim/engine";

/*
 * SVG digital twin: River Athi → intake → pump → smart meter → distribution pipe → storage tank.
 * Water is drawn *inside* each pipe (an inner path on the same geometry) and moves along it with an animated dash
 * pattern only while water is actually flowing in that section. Everything is read from the engine state.
 */

const WATER = "#08a8cd";
const WATER_DEEP = "#0a7fa3";
const PIPE = "#b9c8cc";
const PIPE_EDGE = "#8aa0a6";
const INK = "#0c1a3a";
const MUTED = "#4a5f5f";

// Pipe geometry (shared by the pipe body and the water inside it).
const INTAKE = "M 120 452 L 120 300 L 262 300"; // river → pump (vertical rise, bend)
const PUMP_TO_METER = "M 338 300 L 432 300";
const METER_TO_LEAK = "M 508 300 L 610 300";
const LEAK_TO_TANK = "M 610 300 L 700 300 L 700 150 L 812 150"; // bend + vertical riser → tank inlet

function Pipe({ d, flowing, slow = 1, testId }: { d: string; flowing: boolean; slow?: number; testId: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={PIPE_EDGE} strokeWidth={26} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={PIPE} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
      {/* Water channel: pale and still when empty, blue with moving water when flowing */}
      <path d={d} fill="none" stroke={flowing ? WATER_DEEP : "#dfe9eb"} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
      {flowing && (
        <path
          d={d}
          fill="none"
          stroke={WATER}
          strokeWidth={10}
          strokeLinejoin="round"
          strokeDasharray="18 14"
          className="sim-flow motion-reduce:[animation:none]"
          style={{ animationDuration: `${0.9 / slow}s` }}
          data-testid={testId}
        />
      )}
    </g>
  );
}

function Label({ x, y, title, value, anchor = "middle" }: { x: number; y: number; title: string; value?: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <g textAnchor={anchor} fontFamily="var(--font-sans)">
      <text x={x} y={y} fontSize={19} fontWeight={600} fill={INK}>{title}</text>
      {value && <text x={x} y={y + 23} fontSize={17} fill={MUTED}>{value}</text>}
    </g>
  );
}

export function WaterDiagram({ s }: { s: SimState }) {
  const level = tankPct(s);
  const pumping = s.flowLpm > 0;
  const delivering = s.inflowLpm > 0;
  const slowDown = s.flowLpm > 0 ? s.inflowLpm / s.flowLpm : 1;

  // Tank geometry
  const tx = 800, ty = 110, tw = 170, th = 360;
  const waterH = (level / 100) * (th - 8);
  const surfaceY = ty + th - 4 - waterH;
  const lowY = ty + th - 4 - (s.lowPct / 100) * (th - 8);
  const highY = ty + th - 4 - (s.highPct / 100) * (th - 8);

  // River level band (source availability)
  const riverTop = 520 - 30 - (s.sourcePct / 100) * 70;

  return (
    <svg viewBox="0 60 1080 480" className="h-auto w-full" role="img" aria-label={`Water system: pump ${s.pumpRunning ? "running" : "stopped"}, flow ${Math.round(s.flowLpm)} litres per minute, tank ${level.toFixed(0)} percent full`}>
      <defs>
        <clipPath id="tank-clip"><rect x={tx + 4} y={ty + 4} width={tw - 8} height={th - 8} rx={14} /></clipPath>
        <linearGradient id="water-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#5fd0ea" />
          <stop offset="1" stopColor={WATER_DEEP} />
        </linearGradient>
      </defs>

      {/* River Athi */}
      <path d={`M 0 ${riverTop} Q 60 ${riverTop - 8} 120 ${riverTop} T 240 ${riverTop} L 240 540 L 0 540 Z`} fill="url(#water-grad)" opacity={0.9} />
      <path d={`M 0 ${riverTop + 14} Q 60 ${riverTop + 6} 120 ${riverTop + 14} T 240 ${riverTop + 14}`} fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2}
        className="sim-wave motion-reduce:[animation:none]" />
      <Label x={140} y={riverTop - 46} title="River Athi" value={`Level ${s.sourcePct.toFixed(0)} %`} anchor="start" />
      {/* Intake screen */}
      <rect x={106} y={448} width={28} height={16} rx={3} fill={PIPE_EDGE} />

      {/* Solar panel → power line → pump */}
      <g>
        <line x1={300} y1={150} x2={300} y2={262} stroke={s.solarOk ? "#e2a400" : "#c62828"} strokeWidth={3} strokeDasharray={s.solarOk ? "0" : "6 6"} />
        <g transform="translate(250 90)">
          <rect width={100} height={56} rx={6} fill={s.solarOk ? "#16365c" : "#7a8a90"} />
          {[0, 1, 2].map((c) => [0, 1].map((r) => (
            <rect key={`${c}${r}`} x={6 + c * 31} y={6 + r * 24} width={27} height={20} rx={2} fill={s.solarOk ? "#2f6ea3" : "#9aa8ad"} />
          )))}
          {!s.solarOk && <path d="M 30 8 L 70 48 M 70 8 L 30 48" stroke="#c62828" strokeWidth={6} strokeLinecap="round" />}
        </g>
        <Label x={300} y={78} title={s.solarOk ? "Solar power" : "Solar power failed"} />
      </g>

      {/* Pipes with water inside */}
      <Pipe d={INTAKE} flowing={pumping} testId="flow-intake" />
      <Pipe d={PUMP_TO_METER} flowing={pumping} testId="flow-pump-meter" />
      <Pipe d={METER_TO_LEAK} flowing={pumping} testId="flow-meter-leak" />
      <Pipe d={LEAK_TO_TANK} flowing={delivering} slow={slowDown} testId="flow-to-tank" />
      <Label x={196} y={282} title="Intake" />
      <Label x={596} y={272} title="Distribution pipe" />

      {/* Leak point */}
      {s.leak && (
        <g data-testid="leak">
          <circle cx={610} cy={312} r={7} fill="#c62828" />
          {pumping && [0, 1, 2].map((i) => (
            <circle key={i} cx={610} cy={322} r={4} fill={WATER} className="sim-drip motion-reduce:[animation:none]" style={{ animationDelay: `${i * 0.33}s` }} />
          ))}
          <text x={610} y={390} textAnchor="middle" fontSize={15} fontWeight={600} fill="#c62828" fontFamily="var(--font-sans)">Possible leak</text>
        </g>
      )}

      {/* Pump */}
      <g transform="translate(300 300)" data-testid="pump">
        <circle r={40} fill="#ffffff" stroke={s.pumpFault ? "#c62828" : INK} strokeWidth={4} />
        <g className={s.pumpRunning ? "sim-spin motion-reduce:[animation:none]" : undefined} style={{ transformOrigin: "0 0" }}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} d="M 0 0 Q 10 -14 4 -30" stroke={s.pumpFault ? "#c62828" : "#0a3a6c"} strokeWidth={6} fill="none" strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
          <circle r={7} fill="#0a3a6c" />
        </g>
      </g>
      <Label x={300} y={375} title="Pump" value={s.pumpFault ? "Fault" : s.pumpRunning ? "Running" : "Stopped"} />

      {/* Smart water meter */}
      <g transform="translate(432 262)">
        <rect width={76} height={76} rx={12} fill="#ffffff" stroke={INK} strokeWidth={3} />
        <rect x={8} y={14} width={60} height={30} rx={4} fill="#0c1a3a" />
        <text x={38} y={35} textAnchor="middle" fontSize={15} fontWeight={700} fill="#5fe0a8" fontFamily="ui-monospace, monospace" data-testid="meter-display">
          {Math.round(s.flowLpm)}
        </text>
        <text x={38} y={62} textAnchor="middle" fontSize={11} fill={MUTED} fontFamily="var(--font-sans)">L/min</text>
      </g>
      <Label x={470} y={375} title="Smart meter" value={`${Math.round(s.meterL).toLocaleString("en-GB")} L`} />

      {/* Storage tank */}
      <g>
        <rect x={tx} y={ty} width={tw} height={th} rx={18} fill="#f4f8f9" stroke={INK} strokeWidth={4} />
        <g clipPath="url(#tank-clip)">
          <rect x={tx} y={surfaceY} width={tw} height={waterH + 8} fill="url(#water-grad)" data-testid="tank-water" />
          {waterH > 6 && (
            <path d={`M ${tx} ${surfaceY} q 21 -6 42 0 t 42 0 t 42 0 t 42 0 t 42 0`} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2}
              className="sim-wave motion-reduce:[animation:none]" />
          )}
          {/* Water entering from the inlet */}
          {delivering && (
            <line x1={tx + 26} y1={ty + 40} x2={tx + 26} y2={surfaceY} stroke={WATER} strokeWidth={9} strokeDasharray="14 10"
              className="sim-fall motion-reduce:[animation:none]" data-testid="tank-inflow" />
          )}
        </g>
        {/* Threshold marks */}
        <g fontFamily="var(--font-sans)" fontSize={13}>
          <line x1={tx - 10} x2={tx + tw + 10} y1={highY} y2={highY} stroke="#1b7a43" strokeWidth={2} strokeDasharray="6 5" />
          <text x={tx + tw + 14} y={highY + 4} fill="#1b7a43">High {s.highPct}%</text>
          <line x1={tx - 10} x2={tx + tw + 10} y1={lowY} y2={lowY} stroke="#8f5200" strokeWidth={2} strokeDasharray="6 5" />
          <text x={tx + tw + 14} y={lowY + 4} fill="#8f5200">Low {s.lowPct}%</text>
        </g>
        <text x={tx + tw / 2} y={ty + th / 2} textAnchor="middle" fontSize={38} fontWeight={700} fill={INK} fontFamily="var(--font-sans)" data-testid="tank-pct"
          stroke="#ffffff" strokeWidth={5} paintOrder="stroke">
          {level.toFixed(1)}%
        </text>
      </g>
      <Label x={tx + tw / 2} y={ty - 16} title="Storage tank" />
    </svg>
  );
}
