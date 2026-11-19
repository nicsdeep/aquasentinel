"use client";

/** Shared SVG parts for the water-flow simulation: a pipe with water moving inside it, and a label. */

const WATER = "#08a8cd";
const WATER_DEEP = "#0a7fa3";
const PIPE = "#b9c8cc";
const PIPE_EDGE = "#8aa0a6";
const INK = "#0c1a3a";
const MUTED = "#4a5f5f";

export function Pipe({ d, flowing, slow = 1, testId }: { d: string; flowing: boolean; slow?: number; testId: string }) {
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

export function Label({ x, y, title, value, anchor = "middle" }: { x: number; y: number; title: string; value?: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <g textAnchor={anchor} fontFamily="var(--font-sans)">
      <text x={x} y={y} fontSize={19} fontWeight={600} fill={INK}>{title}</text>
      {value && <text x={x} y={y + 23} fontSize={17} fill={MUTED}>{value}</text>}
    </g>
  );
}
