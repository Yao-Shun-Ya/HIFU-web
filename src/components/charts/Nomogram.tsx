"use client";

import { POINTS, type PatientInput, type Kishi } from "@/lib/model";
import { logit } from "@/lib/stats";
import { useLocale } from "@/lib/i18n";

const W = 940;
const H = 574;
const X0 = 178;
const X1 = 892;
const PP = (X1 - X0) / 100; // 每 1 列线图分值
const PT = (X1 - X0) / 260; // 每 1 总分
const Y_POINTS = 46;
const ROWS = [96, 162, 228, 294, 360, 426];
const Y_TOTAL = 476;
const Y_RISK = 532;
const LOGIT_PER_POINT = 0.050766;
const ZERO_POINTS = 178.71;

const px = (points: number) => X0 + points * PP;
const tx = (total: number) => X0 + Math.min(260, Math.max(0, total)) * PT;
const totalForProb = (p: number) => ZERO_POINTS + logit(p) / LOGIT_PER_POINT;

export function Nomogram({
  input,
  points,
  prob,
  showGuides = true,
}: {
  input: PatientInput;
  points: number;
  prob: number;
  showGuides?: boolean;
}) {
  const { L } = useLocale();
  const guideX = {
    age: px(input.age < 35 ? POINTS.ageUnder35 : 0),
    volume: px(Math.min(100, Math.max(0, (1000 - input.volume) * POINTS.volumePerCm3))),
    wall: px((input.wall - POINTS.wallReference) * POINTS.wallPerMm),
    kishi: px(POINTS.kishi[input.kishi as Kishi]),
    t2: px(input.t2 === "hyper" ? POINTS.t2Hyperintense : 0),
    t1: px(input.t1 === "marked" ? POINTS.t1Marked : 0),
  };
  const totalX = tx(points);
  // Risk 轴仅覆盖论文标注的 0.05–0.95；超出时把标记夹到轴端并提示外推
  const riskLoX = tx(totalForProb(0.05));
  const riskHiX = tx(totalForProb(0.95));
  const markerX = Math.min(Math.max(totalX, riskLoX), riskHiX);
  const mOff = markerX - totalX;
  const extrapolated = totalX < riskLoX || totalX > riskHiX;

  const axis = (y: number, from: number, to: number, labelAt: (v: number) => string, above = true) => (
    <g>
      <line x1={from} y1={y} x2={to} y2={y} stroke="var(--line-strong)" strokeWidth="1.2" />
      {Array.from({ length: 11 }, (_, i) => i).map((i) => {
        const x = from + ((to - from) * i) / 10;
        const v = labelAt(i);
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={above ? y + 5 : y - 5} stroke="var(--line-strong)" />
            {v && (
              <text
                x={x}
                y={above ? y + 18 : y - 9}
                textAnchor="middle"
                className="fill-[var(--muted)] font-mono text-[10px]"
              >
                {v}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );

  const catRow = (
    y: number,
    label: string,
    sub: string,
    cats: { key: string; label: string; pts: number; above: boolean }[],
    activeKey: string,
  ) => {
    const min = Math.min(...cats.map((c) => c.pts));
    const max = Math.max(...cats.map((c) => c.pts));
    return (
      <g>
        <text x={16} y={y - 3} className="fill-[var(--fg)] text-[12.5px]">
          {label}
        </text>
        <text x={16} y={y + 12} className="fill-[var(--muted)] text-[10.5px]">
          {sub}
        </text>
        <line x1={px(min)} y1={y} x2={px(max)} y2={y} stroke="var(--line-strong)" strokeWidth="1.2" />
        {cats.map((c) => (
          <g key={c.key}>
            <line
              x1={px(c.pts)}
              y1={y}
              x2={px(c.pts)}
              y2={c.above ? y - 5 : y + 5}
              stroke="var(--line-strong)"
            />
            <text
              x={px(c.pts)}
              y={c.above ? y - 9 : y + 18}
              textAnchor="middle"
              className={c.key === activeKey ? "fill-[var(--brand)] text-[11.5px] font-semibold" : "fill-[var(--muted)] text-[11px]"}
            >
              {c.label}
            </text>
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={L("交互式列线图", "Interactive nomogram")}>
      {/* Points axis */}
      {axis(Y_POINTS, X0, X1, (i) => `${i * 10}`, false)}
      <text x={16} y={Y_POINTS + 2} className="fill-[var(--fg)] text-[12.5px] font-semibold">
        {L("Points 分值", "Points")}
      </text>

      {/* age */}
      {catRow(ROWS[0], L("年龄", "Age"), "years", [
        { key: "ge", label: "≥35", pts: 0, above: false },
        { key: "lt", label: "<35", pts: POINTS.ageUnder35, above: true },
      ], input.age < 35 ? "lt" : "ge")}

      {/* uterine volume */}
      <g>
        <text x={16} y={ROWS[1] - 3} className="fill-[var(--fg)] text-[12.5px]">
          {L("子宫体积", "Uterine volume")}
        </text>
        <text x={16} y={ROWS[1] + 12} className="fill-[var(--muted)] text-[10.5px]">
          cm³
        </text>
        {axis(ROWS[1], X0, X1, (i) => `${1000 - i * 100}`, false)}
      </g>

      {/* wall thickness */}
      <g>
        <text x={16} y={ROWS[2] - 3} className="fill-[var(--fg)] text-[12.5px]">
          {L("腹壁厚度", "Wall thickness")}
        </text>
        <text x={16} y={ROWS[2] + 12} className="fill-[var(--muted)] text-[10.5px]">
          mm
        </text>
        <line
          x1={px(0)}
          y1={ROWS[2]}
          x2={px(81.1)}
          y2={ROWS[2]}
          stroke="var(--line-strong)"
          strokeWidth="1.2"
        />
        {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((v) => {
          const x = px((v - 10) * POINTS.wallPerMm);
          return (
            <g key={v}>
              <line x1={x} y1={ROWS[2]} x2={x} y2={ROWS[2] + 5} stroke="var(--line-strong)" />
              <text x={x} y={ROWS[2] + 18} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[10px]">
                {v}
              </text>
            </g>
          );
        })}
      </g>

      {/* kishi */}
      {catRow(ROWS[3], L("Kishi 分型", "Kishi type"), L("MRI 分型", "MRI type"), [
        { key: "I", label: "I", pts: POINTS.kishi.I, above: false },
        { key: "III", label: "III", pts: POINTS.kishi.III, above: true },
        { key: "II", label: "II", pts: POINTS.kishi.II, above: false },
        { key: "IV", label: "IV", pts: POINTS.kishi.IV, above: true },
      ], input.kishi)}

      {/* T2WI */}
      {catRow(ROWS[4], L("T2WI 信号", "T2WI signal"), "lesion signal", [
        { key: "hypoIso", label: L("低/等信号", "hypo/iso"), pts: 0, above: false },
        { key: "hyper", label: L("高信号", "hyper"), pts: POINTS.t2Hyperintense, above: true },
      ], input.t2)}

      {/* T1WI */}
      {catRow(ROWS[5], L("T1WI 增强", "T1WI enhancement"), "contrast enhancement", [
        { key: "mildMod", label: L("轻/中度", "mild/mod"), pts: 0, above: false },
        { key: "marked", label: L("明显强化", "marked"), pts: POINTS.t1Marked, above: true },
      ], input.t1)}

      {/* guides */}
      {showGuides &&
        Object.entries(guideX).map(([k, x], i) => (
          <line
            key={k}
            x1={0}
            y1={ROWS[i]}
            x2={0}
            y2={Y_POINTS}
            stroke="var(--brand)"
            strokeWidth="1.3"
            strokeDasharray="3 4"
            className="glide"
            style={{ transform: `translateX(${x}px)` }}
          />
        ))}

      {/* Total points + risk */}
      {axis(Y_TOTAL, X0, X1, (i) => `${i * 26}`, false)}
      <text x={16} y={Y_TOTAL + 2} className="fill-[var(--fg)] text-[12.5px] font-semibold">
        {L("Total Points 总分", "Total Points")}
      </text>

      <g>
        <line
          x1={tx(totalForProb(0.05))}
          y1={Y_RISK}
          x2={tx(totalForProb(0.95))}
          y2={Y_RISK}
          stroke="var(--line-strong)"
          strokeWidth="1.2"
        />
        {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((p) => {
          const x = tx(totalForProb(p));
          return (
            <g key={p}>
              <line x1={x} y1={Y_RISK} x2={x} y2={Y_RISK + 5} stroke="var(--line-strong)" />
              <text x={x} y={Y_RISK + 18} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[10px]">
                {p.toFixed(1)}
              </text>
            </g>
          );
        })}
        <text x={16} y={Y_RISK + 2} className="fill-[var(--fg)] text-[12.5px] font-semibold">
          {L("高难度概率", "P(high difficulty)")}
        </text>
      </g>

      {showGuides && (
        <g className="glide" style={{ transform: `translateX(${totalX}px)` }}>
          <line
            x1={0}
            y1={ROWS[5] + 34}
            x2={0}
            y2={Y_RISK + 8}
            stroke="var(--accent)"
            strokeWidth="1.6"
            strokeDasharray="4 4"
          />
          <circle cx={mOff} cy={Y_RISK} r="5" fill="var(--accent)" />
          {extrapolated && (
            <path
              d={`M${mOff + (totalX > riskHiX ? 7 : -7)},${Y_RISK} l${totalX > riskHiX ? 8 : -8},-5 l0,10 z`}
              fill="var(--accent)"
            />
          )}
          <text
            x={mOff}
            y={Y_RISK - 12}
            textAnchor="middle"
            style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 5 }}
            className="fill-[var(--fg)] font-mono text-[11px] font-semibold"
          >
            {(prob * 100).toFixed(1)}%{extrapolated ? L("（外推）", " (extrapolated)") : ""}
          </text>
          <text
            x={totalX}
            y={Y_TOTAL - 22}
            textAnchor="middle"
            style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 5 }}
            className="fill-[var(--accent)] font-mono text-[11.5px] font-semibold"
          >
            {points.toFixed(0)} {L("分", "pts")}
          </text>
        </g>
      )}
    </svg>
  );
}
