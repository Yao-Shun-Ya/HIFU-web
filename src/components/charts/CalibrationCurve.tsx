"use client";

import { calibrationPoints } from "@/lib/stats";
import { useLocale } from "@/lib/i18n";
import { linePath, makeScale, ticks } from "./helpers";
import { Readout, nearestByX, useChartHover } from "./hover";

const W = 340;
const H = 340;
const P = 46;

export function CalibrationCurve({
  curves,
}: {
  curves: { label: string; slope: number; color: string; dash?: string }[];
}) {
  const { L } = useLocale();
  const sx = makeScale(0, 1, P, W - 14);
  const sy = makeScale(0, 1, H - P, 14);
  const t = ticks(0, 1, 0.25);
  const { pos, handlers } = useChartHover(W, H);

  const paths = curves.map((c) =>
    calibrationPoints(c.slope).map((p) => ({ x: sx(p.pred), y: sy(p.obs), pred: p.pred, obs: p.obs })),
  );
  const hover = pos ? nearestByX(paths[0], pos.x) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-pan-y"
      role="img"
      aria-label="Calibration curve"
      {...handlers}
    >
      {t.map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(1)} stroke="var(--line)" />
          <line x1={sx(0)} y1={sy(v)} x2={sx(1)} y2={sy(v)} stroke="var(--line)" />
          <text x={sx(v)} y={H - P + 16} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[9px]">
            {v.toFixed(2)}
          </text>
          <text x={P - 8} y={sy(v) + 3} textAnchor="end" className="fill-[var(--muted)] font-mono text-[9px]">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(0)} stroke="var(--line-strong)" strokeWidth="1" />
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="var(--line-strong)" strokeDasharray="5 4" />
      {curves.map((c, i) => {
        const pts = paths[i];
        return (
          <g key={c.label}>
            <path
              d={linePath(pts)}
              pathLength={1}
              fill="none"
              stroke={c.color}
              strokeWidth="2.4"
              strokeDasharray={c.dash}
              strokeLinecap="round"
              className={c.dash ? "fade" : "draw"}
              style={{ ["--d" as string]: `${i * 0.25}s` }}
            />
            {paths[i]
              .filter((_, j) => j % 4 === 0)
              .map((p, j) => (
                <circle
                  key={j}
                  cx={p.x}
                  cy={p.y}
                  r="2.6"
                  fill="var(--surface)"
                  stroke={c.color}
                  strokeWidth="1.6"
                />
              ))}
          </g>
        );
      })}

      {hover && (
        <g pointerEvents="none">
          <line x1={hover.x} y1={sy(0)} x2={hover.x} y2={hover.y} stroke="var(--brand)" strokeOpacity="0.45" strokeDasharray="3 3" />
          <line x1={P} y1={hover.y} x2={hover.x} y2={hover.y} stroke="var(--brand)" strokeOpacity="0.45" strokeDasharray="3 3" />
          <circle cx={hover.x} cy={hover.y} r="4.2" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2" />
          <Readout
            x={hover.x}
            y={hover.y}
            W={W}
            lines={[
              { k: L("预测概率", "Predicted"), v: hover.pred.toFixed(2) },
              { k: L("观察比例", "Observed"), v: hover.obs.toFixed(2) },
              {
                k: L("偏差", "Deviation"),
                v: `${hover.obs - hover.pred >= 0 ? "+" : ""}${(hover.obs - hover.pred).toFixed(2)}`,
              },
            ]}
          />
        </g>
      )}

      <text x={W - 14} y={H - 12} textAnchor="end" className="fill-[var(--muted)] text-[10px]">
        {L("预测概率", "Predicted probability")}
      </text>
      <text
        transform={`translate(9, ${H / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-[var(--muted)] text-[10px]"
      >
        {L("观察比例", "Observed proportion")}
      </text>
      <g>
        {curves.map((c, i) => (
          <g key={c.label} transform={`translate(${W - P - 10},${H - P - 34 + i * 18})`}>
            <line x1="-20" y1="0" x2="-2" y2="0" stroke={c.color} strokeWidth="2.4" strokeDasharray={c.dash} />
            <text x="-26" y="3.5" textAnchor="end" className="fill-[var(--fg)] text-[10.5px]">
              {c.label}
            </text>
          </g>
        ))}
      </g>

      <rect x={P} y={14} width={W - P - 14} height={H - P - 14} fill="transparent" />
    </svg>
  );
}
