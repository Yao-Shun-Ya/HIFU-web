"use client";

import { Reveal } from "@/components/site/Reveal";
import { EXCLUSIONS } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
import { ArrowDown, ArrowRight } from "lucide-react";

function Box({
  title,
  n,
  tone = "default",
  lines,
}: {
  title: string;
  n?: string;
  tone?: "default" | "accent" | "high" | "low" | "danger";
  lines?: string[];
}) {
  const tones = {
    default: "border-line bg-surface",
    accent: "border-brand/40 bg-brand-soft",
    high: "border-high/35 bg-high/8",
    low: "border-low/35 bg-low/8",
    danger: "border-high/40 bg-high/6",
  } as const;
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${tones[tone]}`}>
      <p className="text-[13px] font-semibold">{title}</p>
      {n && <p className="mt-0.5 font-mono text-[12px] text-muted">{n}</p>}
      {lines && (
        <ul className="mt-2 space-y-1 text-left text-[11.5px] text-muted">
          {lines.map((l) => (
            <li key={l} className="flex justify-between gap-3">
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Arrow = () => (
  <div className="flex justify-center py-1.5 text-muted">
    <ArrowDown className="h-4 w-4" />
  </div>
);

export function CohortFlow() {
  const { L, T } = useLocale();
  return (
    <Reveal>
      <div className="surface rounded-2xl p-5 sm:p-7">
        <div className="mx-auto max-w-2xl">
          <Box title={L("连续筛选：诊断子宫腺肌病并行 HIFU 消融", "Consecutive screening: diagnosed AM undergoing HIFU ablation")} n="n = 1032（2016.03 – 2024.03）" />
          <Arrow />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <Box
              title={L("排除", "Excluded")}
              n="n = 546"
              tone="danger"
              lines={EXCLUSIONS.map((e) => `${T(e.r)} · n=${e.n}`)}
            />
            <div className="hidden justify-center text-muted sm:flex">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </div>
            <Box title={L("最终纳入", "Finally included")} n="n = 486" tone="accent" />
          </div>
          <Arrow />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: L("训练集", "Training set"), total: "n = 340", high: 84, low: 256 },
              { name: L("内部验证集", "Internal validation set"), total: "n = 146", high: 30, low: 116 },
            ].map((g) => (
              <div key={g.name} className="rounded-xl border border-line bg-surface-2/60 p-3">
                <p className="text-center text-[13px] font-semibold">{g.name}</p>
                <p className="mb-3 text-center font-mono text-[12px] text-muted">{g.total}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Box title={L("高难度", "High difficulty")} n={`n = ${g.high}`} tone="high" />
                  <Box title={L("低难度", "Low difficulty")} n={`n = ${g.low}`} tone="low" />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-high/70"
                    style={{ width: `${(g.high / (g.high + g.low)) * 100}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center font-mono text-[11px] text-muted">
                  {L("高难度占比", "High-difficulty share")} {((g.high / (g.high + g.low)) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11.5px] leading-relaxed text-muted">
            {L(
              "训练集与内部验证集按约 7:3 随机划分；两组临床特征、病灶 MRI 特征与影像分型差异均无统计学意义（P &gt; 0.05）。",
              "Training and internal validation sets were split randomly at about 7:3; clinical features, lesion MRI features and imaging classification did not differ significantly between groups (P &gt; 0.05).",
            )}
          </p>
        </div>
      </div>
    </Reveal>
  );
}
