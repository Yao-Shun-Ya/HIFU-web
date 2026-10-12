"use client";

import { useLocale } from "@/lib/i18n";
export function HifuVisual() {
  const { L } = useLocale();
  const beams = [-26, -18, -9, 0, 9, 18, 26];
  const focus = { x: 210, y: 205 };
  return (
    <svg viewBox="0 0 380 330" className="w-full max-w-[420px]" aria-hidden>
      <defs>
        <radialGradient id="heat">
          <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand2)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="myo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--hero-ink)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* probe */}
      <path d="M110 46 Q190 6 270 46 L270 60 Q190 22 110 60 Z" fill="var(--brand2)" fillOpacity="0.3" stroke="var(--brand2)" strokeOpacity="0.55" />
      <text x="190" y="34" textAnchor="middle" className="fill-[var(--hero-muted)] font-mono text-[9px]">
        US-guided HIFU {L("换能器", "transducer")}
      </text>

      {/* uterus */}
      <path
        d="M96 150 C96 104 134 84 190 84 C246 84 284 104 284 150 C284 208 250 254 190 286 C130 254 96 208 96 150 Z"
        fill="url(#myo)"
        stroke="var(--hero-ink)"
        strokeOpacity="0.62"
        strokeWidth="1.4"
      />
      <path d="M168 158 L190 122 L212 158 L190 196 Z" fill="var(--hero-ink)" fillOpacity="0.22" stroke="var(--hero-ink)" strokeOpacity="0.5" />
      <text x="190" y="300" textAnchor="middle" className="fill-[var(--hero-muted)] font-mono text-[9px]">
        {L("子宫肌层 / 腺肌病灶", "Myometrium / lesion")}
      </text>

      {/* beams */}
      {beams.map((a, i) => {
        const x0 = 190 + a * 2.6;
        const path = `M${x0},58 L${focus.x},${focus.y}`;
        return (
          <g key={a}>
            <path
              d={path}
              pathLength={1}
              stroke="url(#beam)"
              strokeWidth="2.4"
              className="draw"
              style={{ ["--d" as string]: `${0.3 + i * 0.08}s` }}
            />
            {/* 能量沿声束持续流向焦点 */}
            <path
              d={path}
              stroke="var(--brand)"
              strokeOpacity="0.5"
              strokeWidth="1.3"
              strokeLinecap="round"
              className="beam-flow"
            />
          </g>
        );
      })}

      {/* focus */}
      <circle
        cx={focus.x}
        cy={focus.y}
        r="34"
        fill="url(#heat)"
        className="fade animate-pulse-soft"
        style={{ ["--d" as string]: "1.1s" }}
      />
      <circle cx={focus.x} cy={focus.y} r="6" fill="#ff8a5c" className="pop" style={{ ["--d" as string]: "1.25s" }} />
      <circle
        cx={focus.x}
        cy={focus.y}
        r="16"
        fill="none"
        stroke="#ff8a5c"
        strokeWidth="1.2"
        className="focus-ring"
        style={{ ["--d" as string]: "1.6s" }}
      />

      {/* annotation */}
      <g className="fill-[var(--hero-muted)] font-mono text-[9px]">
        <line x1={focus.x + 30} y1={focus.y - 22} x2="330" y2="120" stroke="var(--hero-ink)" strokeOpacity="0.4" />
        <text x="332" y="116" textAnchor="end">
          {L("焦点：不可逆凝固性坏死", "Focus: necrosis")}
        </text>
      </g>
    </svg>
  );
}
