"use client";

import { useLocale } from "@/lib/i18n";
import { useEased } from "@/components/site/motion";


const R = 84;
const CX = 110;
const CY = 110;
const A0 = 135;
const SWEEP = 270;

const polar = (deg: number) => {
  const r = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(r), CY + R * Math.sin(r)] as const;
};

const arc = (f0: number, f1: number) => {
  const [x0, y0] = polar(A0 + SWEEP * f0);
  const [x1, y1] = polar(A0 + SWEEP * f1);
  const large = (f1 - f0) * SWEEP > 180 ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};

export function RiskGauge({ prob, color, label }: { prob: number; color: string; label: string }) {
  const { L } = useLocale();
  const bands = [
    { f0: 0, f1: 0.1, c: "var(--low)" },
    { f0: 0.1, f1: 0.4, c: "var(--mid)" },
    { f0: 0.4, f1: 1, c: "var(--high)" },
  ];
  const shown = useEased(prob, 850);
  return (
    <div className="relative">
      <svg viewBox="0 0 220 200" className="w-full max-w-[300px]" role="img" aria-label={`${L("高消融难度概率", "Probability of high difficulty")} ${(prob * 100).toFixed(1)}%`}>
        {bands.map((b, i) => (
          <path key={i} d={arc(b.f0, b.f1)} fill="none" stroke={b.c} strokeOpacity="0.22" strokeWidth="14" strokeLinecap="butt" />
        ))}
        <path d={arc(0, 1)} fill="none" stroke="var(--line)" strokeWidth="1" strokeOpacity="0.5" />
        <path
          d={arc(0, 1)}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0.004, shown)} 1`}
        />
        <circle
          cx={polar(A0 + SWEEP * Math.max(0.004, shown))[0]}
          cy={polar(A0 + SWEEP * Math.max(0.004, shown))[1]}
          r="3.4"
          fill="var(--surface)"
          stroke={color}
          strokeWidth="2"
        />
        {[0.1, 0.4].map((f) => {
          const [x, y] = polar(A0 + SWEEP * f);
          return (
            <text
              key={f}
              x={x * 1.19 - CX * 0.19}
              y={y * 1.19 - CY * 0.19 + 3}
              textAnchor="middle"
              className="fill-[var(--muted)] font-mono text-[9.5px]"
            >
              {(f * 100).toFixed(0)}%
            </text>
          );
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" className="fill-[var(--fg)] font-mono text-[30px] font-semibold">
          {(shown * 100).toFixed(1)}%
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
          {L("高消融难度概率", "probability of high difficulty")}
        </text>
      </svg>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-1 mx-auto w-fit rounded-full border px-3 py-1 text-[12px] font-semibold"
        style={{ color, borderColor: color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
      >
        {label}
      </div>
    </div>
  );
}
