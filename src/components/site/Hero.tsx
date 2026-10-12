"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  ArrowRight,
  Activity,
  GitBranch,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { HifuVisual } from "./HifuVisual";
import { HEADLINE } from "@/lib/data";
import { useLocale } from "@/lib/i18n";
import { CountUp, usePointerParallax } from "./motion";

const d = (i: number) => ({ ["--d" as string]: `${0.08 + i * 0.1}s` });
const ld = (ms: number) => ({ ["--d" as string]: `${ms}ms` });

export function Hero() {
  const { L, T } = useLocale();
  const visual = useRef<HTMLDivElement>(null);
  const parallax = usePointerParallax(visual, { deg: 5, shift: 14 });

  return (
    <section
      className="hero-mesh relative overflow-hidden"
      onPointerMove={parallax.onPointerMove}
      onPointerLeave={parallax.onPointerLeave}
    >
      <div className="hero-grid absolute inset-0" />
      <div
        aria-hidden="true"
        className="drift-a pointer-events-none absolute -left-32 -top-28 h-[460px] w-[560px] rounded-full bg-[radial-gradient(closest-side,var(--hero-glow-1),transparent)] opacity-70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="drift-b pointer-events-none absolute -right-28 top-8 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,var(--hero-glow-2),transparent)] opacity-70 blur-3xl"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--hero-bg-3)]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-16 sm:pt-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <div
            className="rise mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--hero-line)] bg-[var(--hero-chip)] px-3 py-1.5 text-[11.5px] text-[var(--hero-muted)]"
            style={d(0)}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            {L(
              "单中心回顾性队列 · 486 例 · 2016.03–2024.03",
              "Single-centre retrospective cohort · 486 cases · 2016.03–2024.03",
            )}
          </div>

          <h1 className="text-balance text-[30px] font-semibold leading-[1.15] tracking-tight text-[var(--hero-fg)] sm:text-[46px]">
            <span className="line-mask" style={ld(140)}>
              <span>{L("术前一次 MRI，", "One pre-treatment MRI,")}</span>
            </span>
            <span className="line-mask" style={ld(260)}>
              <span>{L("就能算出这台 HIFU", "tells you how hard this")}</span>
            </span>
            <span className="line-mask" style={ld(380)}>
              <span className="bg-gradient-to-r from-brand to-brand2 bg-clip-text text-transparent">
                {L("有多难", "HIFU ablation will be")}
              </span>
            </span>
          </h1>

          <p className="rise mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--hero-muted)]" style={d(3)}>
            {L(
              "基于 MRI 与临床特征的子宫腺肌病（AM）超声引导高强度聚焦超声（US-guided HIFU）",
              "A nomogram for high-difficulty US-guided HIFU ablation of adenomyosis (AM), built from MRI and clinical features: ",
            )}
            <strong className="text-[var(--hero-strong)]">
              {L(
                "高消融难度列线图模型",
                "6 pre-treatment variables → total points → probability of high difficulty",
              )}
            </strong>
            {L(
              "：6 个术前可及因子 → 总分 → 高难度概率，用于患者筛选、能量预算与术前沟通。",
              " — for case selection, energy budgeting and pre-operative counselling.",
            )}
          </p>

          <div className="rise mt-7 flex flex-wrap gap-3" style={d(4)}>
            <Link
              href="/assessment"
              className="sheen group inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[14px] font-semibold text-on-brand transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-16px_color-mix(in_oklab,var(--brand)_70%,transparent)] active:translate-y-0"
            >
              {L("开始术前评估", "Start pre-op assessment")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/results"
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--hero-line-strong)] px-5 py-3 text-[14px] text-[var(--hero-strong)] transition-colors duration-300 hover:border-brand hover:text-[var(--hero-fg)]"
            >
              {L("查看模型验证证据", "See validation evidence")}
              <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </div>

          <div className="rise mt-9 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4" style={d(5)}>
            {HEADLINE.map((h, i) => (
              <div key={h.v} className="group">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--hero-faint)]">
                  {T(h.k)}
                </p>
                <p className="mt-1 font-mono text-[26px] font-semibold text-[var(--hero-fg)]">
                  <CountUp value={h.v} duration={900 + i * 120} />
                </p>
                <p className="font-mono text-[10.5px] text-[var(--hero-faint)]">{T(h.sub)}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={visual} className="tilt rise" style={d(3)}>
          <div className="animate-floaty">
            <HifuVisual />
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-wrap gap-6 px-5 pb-12 text-[12px] text-[var(--hero-faint)]">
        <span className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[var(--hero-strong)]">
          <Activity className="h-3.5 w-3.5 text-brand" />{" "}
          {L("三重验证：ROC / 校准 / DCA", "Triple validation: ROC / calibration / DCA")}
        </span>
        <span className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[var(--hero-strong)]">
          <GitBranch className="h-3.5 w-3.5 text-brand" />{" "}
          {L("LASSO（1-SE）+ 多因素 Logistic", "LASSO (1-SE) + multivariable logistic")}
        </span>
        <span className="inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[var(--hero-strong)]">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />{" "}
          {L("0–6 分综合消融难度评分", "0–6 composite ablation-difficulty score")}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 right-6 hidden items-center gap-3 text-[var(--hero-faint)] lg:flex"
      >
        <span className="font-mono text-[9.5px] uppercase tracking-[0.24em]">
          {L("向下滚动", "scroll")}
        </span>
        <span className="hairline h-8 w-px bg-[var(--hero-line-strong)]" />
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}
