"use client";

import type { SimState } from "@/lib/sim/engine";
import { tankPct } from "@/lib/sim/engine";
import { Label, Pipe } from "./sim-parts";

/*
 * Photo version of the digital twin. The photos show existing water systems (used with the owner's permission, for
 * illustration); the water, levels, pump state and meter drawn over them come live from the same engine state.
 */

export const PHOTOS = {
  river: { src: "/sim/river.jpg", caption: "River Athi" },
  pump: { src: "/sim/pumphouse.jpg", caption: "Raw water pump house" },
  solar: { src: "/sim/solar.jpg", caption: "Solar-powered pumping" },
  pipeline: { src: "/sim/pipeline.jpg", caption: "Pipeline (Masalani–Gababa)" },
  tank: { src: "/sim/tanks.jpg", caption: "Elevated storage tanks" },
} as const;

const WATER = "#08a8cd";
const INK = "#0c1a3a";

function PhotoCard({ id, x, y, w, h, photo, children }: {
  id: string; x: number; y: number; w: number; h: number; photo: { src: string; caption: string }; children?: React.ReactNode;
}) {
  return (
    <g>
      <defs><clipPath id={`clip-${id}`}><rect x={x} y={y} width={w} height={h} rx={16} /></clipPath></defs>
      <g clipPath={`url(#clip-${id})`}>
        <image href={photo.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
        {children}
        <rect x={x} y={y + h - 34} width={w} height={34} fill="#0c1a3a" opacity={0.62} />
        <text x={x + 12} y={y + h - 12} fontSize={15} fontWeight={600} fill="#ffffff" fontFamily="var(--font-sans)">{photo.caption}</text>
      </g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill="none" stroke="#ffffff" strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h} rx={16} fill="none" stroke="#c6d4d8" strokeWidth={1} />
    </g>
  );
}

function PumpBadge({ cx, cy, s }: { cx: number; cy: number; s: SimState }) {
  const color = s.pumpFault ? "#c62828" : "#0a3a6c";
  return (
    <g transform={`translate(${cx} ${cy})`} data-testid="pump">
      <circle r={30} fill="#ffffff" stroke={color} strokeWidth={4} />
      <g className={s.pumpRunning ? "sim-spin motion-reduce:[animation:none]" : undefined}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M 0 0 Q 8 -10 3 -22" stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
        <circle r={5} fill={color} />
      </g>
    </g>
  );
}

function Meter({ x, y, s }: { x: number; y: number; s: SimState }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={80} height={80} rx={12} fill="#ffffff" stroke={INK} strokeWidth={3} />
      <rect x={8} y={14} width={64} height={30} rx={4} fill={INK} />
      <text x={40} y={35} textAnchor="middle" fontSize={15} fontWeight={700} fill="#5fe0a8" fontFamily="ui-monospace, monospace" data-testid="meter-display">{Math.round(s.flowLpm)}</text>
      <text x={40} y={64} textAnchor="middle" fontSize={11} fill="#4a5f5f" fontFamily="var(--font-sans)">L/min</text>
    </g>
  );
}

/** Water level drawn over the tank photo, with threshold marks. */
function TankOverlay({ x, y, w, h, s }: { x: number; y: number; w: number; h: number; s: SimState }) {
  const level = tankPct(s);
  const usable = h - 34;
  const wy = y + usable - (level / 100) * usable;
  const lineY = (p: number) => y + usable - (p / 100) * usable;
  return (
    <g>
      <rect x={x} y={wy} width={w} height={(level / 100) * usable} fill={WATER} opacity={0.45} data-testid="tank-water" />
      <line x1={x} x2={x + w} y1={wy} y2={wy} stroke="#ffffff" strokeWidth={2.5} />
      <line x1={x} x2={x + w} y1={lineY(s.highPct)} y2={lineY(s.highPct)} stroke="#7dffb0" strokeWidth={2} strokeDasharray="7 5" />
      <line x1={x} x2={x + w} y1={lineY(s.lowPct)} y2={lineY(s.lowPct)} stroke="#ffcf6b" strokeWidth={2} strokeDasharray="7 5" />
      <text x={x + w / 2} y={y + usable / 2} textAnchor="middle" fontSize={40} fontWeight={700} fill="#ffffff" stroke={INK} strokeWidth={5} paintOrder="stroke"
        fontFamily="var(--font-sans)" data-testid="tank-pct">{level.toFixed(1)}%</text>
    </g>
  );
}

function RiverOverlay({ x, y, w, h, s }: { x: number; y: number; w: number; h: number; s: SimState }) {
  const bandH = (s.sourcePct / 100) * (h - 34) * 0.5;
  return (
    <g>
      <rect x={x} y={y + h - 34 - bandH} width={w} height={bandH} fill={WATER} opacity={0.35} />
      <text x={x + 12} y={y + 28} fontSize={15} fontWeight={700} fill="#ffffff" stroke={INK} strokeWidth={4} paintOrder="stroke" fontFamily="var(--font-sans)">
        Level {s.sourcePct.toFixed(0)} %
      </text>
    </g>
  );
}

function Leak({ x, y, s }: { x: number; y: number; s: SimState }) {
  if (!s.leak) return null;
  return (
    <g data-testid="leak">
      <circle cx={x} cy={y + 12} r={7} fill="#c62828" />
      {s.flowLpm > 0 && [0, 1, 2].map((i) => (
        <circle key={i} cx={x} cy={y + 22} r={4} fill={WATER} className="sim-drip motion-reduce:[animation:none]" style={{ animationDelay: `${i * 0.33}s` }} />
      ))}
      <text x={x} y={y + 78} textAnchor="middle" fontSize={15} fontWeight={600} fill="#c62828" fontFamily="var(--font-sans)">Possible leak</text>
    </g>
  );
}

function SolarLine({ x1, y1, x2, y2, s }: { x1: number; y1: number; x2: number; y2: number; s: SimState }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={s.solarOk ? "#e2a400" : "#c62828"} strokeWidth={3} strokeDasharray={s.solarOk ? "0" : "6 6"} />;
}

/** Photo cards connected by the live pipeline. */
function ChainDiagram({ s }: { s: SimState }) {
  const pumping = s.flowLpm > 0;
  const delivering = s.inflowLpm > 0;
  const slow = s.flowLpm > 0 ? s.inflowLpm / s.flowLpm : 1;
  return (
    <svg viewBox="0 0 1200 600" className="h-auto w-full" role="img" aria-label={`Pump ${s.pumpRunning ? "running" : "stopped"}, flow ${Math.round(s.flowLpm)} litres per minute, tank ${tankPct(s).toFixed(0)} percent full`}>
      <SolarLine x1={420} y1={150} x2={420} y2={250} s={s} />
      <PhotoCard id="solar" x={300} y={20} w={240} h={130} photo={PHOTOS.solar}>
        {!s.solarOk && <rect x={300} y={20} width={240} height={130} fill="#c62828" opacity={0.35} />}
      </PhotoCard>
      <Pipe d="M 210 400 L 300 400" flowing={pumping} testId="flow-intake" />
      <Pipe d="M 540 400 L 600 400" flowing={pumping} testId="flow-pump-meter" />
      <Pipe d="M 680 400 L 780 400" flowing={pumping} testId="flow-meter-leak" />
      <Pipe d="M 780 400 L 900 400 L 900 220 L 960 220" flowing={delivering} slow={slow} testId="flow-to-tank" />
      <PhotoCard id="river" x={20} y={230} w={200} h={320} photo={PHOTOS.river}><RiverOverlay x={20} y={230} w={200} h={320} s={s} /></PhotoCard>
      <PhotoCard id="pump" x={300} y={250} w={240} h={230} photo={PHOTOS.pump} />
      <PumpBadge cx={510} cy={282} s={s} />
      <Label x={420} y={515} title={s.pumpFault ? "Pump: fault" : s.pumpRunning ? "Pump: running" : "Pump: stopped"} />
      <Meter x={600} y={360} s={s} />
      <Label x={640} y={470} title="Smart meter" value={`${Math.round(s.meterL).toLocaleString("en-GB")} L`} />
      <Leak x={780} y={400} s={s} />
      <PhotoCard id="pipeline" x={700} y={430} w={250} h={150} photo={PHOTOS.pipeline} />
      <PhotoCard id="tank" x={960} y={40} w={220} h={440} photo={PHOTOS.tank}><TankOverlay x={960} y={40} w={220} h={440} s={s} /></PhotoCard>
      {delivering && <line x1={975} y1={220} x2={1010} y2={220} stroke={WATER} strokeWidth={8} strokeDasharray="12 8" className="sim-fall motion-reduce:[animation:none]" data-testid="tank-inflow" />}
    </svg>
  );
}

/** The photo digital twin (owner's choice, Option A "photo chain", 19 Nov 2026). */
export function PhotoDiagram({ s }: { s: SimState }) {
  return <ChainDiagram s={s} />;
}

export const PHOTO_NOTE =
  "Photos of existing water systems in Makueni and elsewhere in Kenya, used with permission for illustration. They are not AquaSentinel installations; water, levels and readings shown on them are simulated.";
