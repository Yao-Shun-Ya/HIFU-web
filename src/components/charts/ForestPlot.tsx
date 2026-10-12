"use client";

import { OR_TABLE } from "@/lib/model";
import { useLocale } from "@/lib/i18n";

const W = 690;
const ROW = 34;
const P = 250;
const R = 556;
const H = OR_TABLE.length * ROW + 56;

const lo = 0.3;
const hi = 9;
const sx = (v: number) => P + (Math.log(v / lo) / Math.log(hi / lo)) * (R - P);

export function ForestPlot() {
  const { T, L } = useLocale();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Forest plot of odds ratios">
      {[0.5, 1, 2, 4, 8].map((v) => (
        <g key={v}>
          <line
            x1={sx(v)}
            y1={26}
            x2={sx(v)}
            y2={H - 34}
            stroke={v === 1 ? "var(--line-strong)" : "var(--line)"}
            strokeDasharray={v === 1 ? "0" : "3 4"}
          />
          <text x={sx(v)} y={H - 16} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[10px]">
            {v}
          </text>
        </g>
      ))}
      {OR_TABLE.map((d, i) => {
        const y = 42 + i * ROW;
        return (
          <g key={T(d.var)} className="group/row">
            <title>
              {`${T(d.var)}  ·  OR ${d.or.toFixed(2)} (95%CI ${d.lo.toFixed(2)} – ${d.hi.toFixed(2)})`}
            </title>
            <rect
              x={4}
              y={y - ROW / 2}
              width={W - 8}
              height={ROW}
              rx="8"
              fill="transparent"
              className="transition-colors duration-300 group-hover/row:fill-[color-mix(in_oklab,var(--brand)_10%,transparent)]"
            />
            <text
              x={12}
              y={y + 4}
              className="fill-[var(--fg)] text-[11.5px] transition-transform duration-300 group-hover/row:translate-x-[2px]"
            >
              {T(d.var)}
            </text>
            <g
              className="slide transition-transform duration-300 group-hover/row:scale-[1.06]"
              style={{
                ["--d" as string]: `${i * 0.07}s`,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            >
              <line x1={sx(d.lo)} y1={y} x2={sx(d.hi)} y2={y} stroke="var(--brand2)" strokeWidth="1.8" />
              <line x1={sx(d.lo)} y1={y - 4} x2={sx(d.lo)} y2={y + 4} stroke="var(--brand2)" strokeWidth="1.6" />
              <line x1={sx(d.hi)} y1={y - 4} x2={sx(d.hi)} y2={y + 4} stroke="var(--brand2)" strokeWidth="1.6" />
              <rect
                x={sx(d.or) - 5}
                y={y - 5}
                width="10"
                height="10"
                fill="var(--brand)"
                transform={`rotate(45 ${sx(d.or)} ${y})`}
              />
            </g>
            <text
              x={R + 12}
              y={y + 4}
              className="fill-[var(--muted)] font-mono text-[10.5px] transition-colors duration-300 group-hover/row:fill-[var(--fg)]"
            >
              {d.or.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={R + 12} y={26} className="fill-[var(--muted)] font-mono text-[10px]">
        OR
      </text>
      <text x={12} y={H - 16} className="fill-[var(--muted)] font-mono text-[9.5px]">
        {L("悬停查看 95%CI", "Hover for 95% CI")}
      </text>
    </svg>
  );
}
