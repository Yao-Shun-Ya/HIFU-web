"use client";

import { dcaPoints } from "@/lib/stats";
import { linePath, makeScale, ticks } from "./helpers";
import { useLocale } from "@/lib/i18n";
import { Readout, nearestByX, useChartHover } from "./hover";

const W = 340;
const H = 340;
const P = 46;

export function DcaCurve({
  auc,
  prevalence,
  label,
}: {
  auc: number;
  prevalence: number;
  label: string;
}) {
  const { L } = useLocale();
  const sx = makeScale(0, 1, P, W - 14);
  const maxY = 0.3;
  const sy = makeScale(0, maxY, H - P, 14);
  const pts = dcaPoints(auc, prevalence);
  const model = pts.map((p) => ({
    x: sx(p.pt),
    y: sy(Math.min(p.model, maxY)),
    pt: p.pt,
    model: p.model,
    all: p.all,
  }));
  const all = model.map((p) => ({ x: p.x, y: sy(Math.min(p.all, maxY)) }));
  const positive = pts.filter((p) => p.model > 0.001);
  const x0 = sx(positive[0]?.pt ?? 0);
  const x1 = sx(positive[positive.length - 1]?.pt ?? 1);
  const { pos, handlers } = useChartHover(W, H);
  const hover = pos ? nearestByX(model, pos.x) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-pan-y"
      role="img"
      aria-label={`Decision curve (${label})`}
      {...handlers}
    >
      <rect x={x0} y={14} width={Math.max(0, x1 - x0)} height={H - P - 14} fill="var(--brand)" opacity="0.07" />
      {ticks(0, 1, 0.25).map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(maxY)} stroke="var(--line)" />
          <text x={sx(v)} y={H - P + 16} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[9px]">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      {ticks(0, maxY, 0.1).map((v) => (
        <text key={v} x={P - 8} y={sy(v) + 3} textAnchor="end" className="fill-[var(--muted)] font-mono text-[9px]">
          {v.toFixed(1)}
        </text>
      ))}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(0)} stroke="var(--line-strong)" />

      <path d={linePath(all)} fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeDasharray="5 4" />
      <path
        d={linePath(model)}
        pathLength={1}
        fill="none"
        stroke="var(--brand)"
        strokeWidth="2.6"
        strokeLinecap="round"
        className="draw"
      />

      {hover && (
        <g pointerEvents="none">
          <line x1={hover.x} y1={14} x2={hover.x} y2={sy(0)} stroke="var(--brand)" strokeOpacity="0.45" strokeDasharray="3 3" />
          <line x1={P} y1={hover.y} x2={hover.x} y2={hover.y} stroke="var(--brand)" strokeOpacity="0.45" strokeDasharray="3 3" />
          <circle cx={hover.x} cy={hover.y} r="4.2" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2" />
          <Readout
            x={hover.x}
            y={hover.y}
            W={W}
            lines={[
              { k: L("阈值概率", "Threshold"), v: hover.pt.toFixed(2) },
              { k: L("模型净获益", "Model NB"), v: hover.model.toFixed(3) },
              { k: L("全干预净获益", "Treat-all NB"), v: hover.all.toFixed(3) },
            ]}
          />
        </g>
      )}

      <text x={W - 16} y={H - 12} textAnchor="end" className="fill-[var(--muted)] text-[10px]">
        {L("阈值概率", "Threshold probability")}
      </text>
      <text
        transform={`translate(9, ${H / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-[var(--muted)] text-[10px]"
      >
        {L("净获益", "Net benefit")}
      </text>
      <g transform={`translate(${W - P - 10},${H - P - 52})`}>
        <line x1="-18" y1="0" x2="-2" y2="0" stroke="var(--brand)" strokeWidth="2.6" />
        <text x="-24" y="3.5" textAnchor="end" className="fill-[var(--fg)] text-[10.5px]">
          {L("列线图模型", "Nomogram")}
        </text>
        <line x1="-18" y1="17" x2="-2" y2="17" stroke="var(--muted)" strokeWidth="1.8" strokeDasharray="5 4" />
        <text x="-24" y="20.5" textAnchor="end" className="fill-[var(--fg)] text-[10.5px]">
          {L("全部按高难度处理", "Treat all as difficult")}
        </text>
        <text x="-24" y="37" textAnchor="end" className="fill-[var(--muted)] text-[10.5px]">
          {L("全部按低难度处理 = 0", "Treat none = 0")}
        </text>
      </g>

      <rect x={P} y={14} width={W - P - 14} height={H - P - 14} fill="transparent" />
    </svg>
  );
}
