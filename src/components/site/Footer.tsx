"use client";

import Link from "next/link";
import { SITE } from "@/lib/data";
import { useLocale } from "@/lib/i18n";

export function Footer() {
  const { L, T } = useLocale();
  return (
    <footer className="no-print mt-24 border-t border-line bg-surface-2/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold">{L(SITE.title, SITE.titleEn)}</p>
          <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
            {L(
              `${SITE.subtitle}。本站为科研成果展示与术前风险分层演示工具，不替代临床判断，亦不用于个体化诊疗决策。`,
              `${SITE.subtitleEn}. This site is a research-output showcase and a demonstration of pre-operative risk stratification; it does not replace clinical judgement and is not used for individualised treatment decisions.`,
            )}
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted">
            {L(SITE.org, SITE.orgEn)} · {SITE.period}
          </p>
        </div>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {L("导航", "Navigation")}
          </p>
          <ul className="space-y-2 text-[13px]">
            {SITE.nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted transition-colors hover:text-brand">
                  {T(n.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {L("模型要点", "Model at a glance")}
          </p>
          <ul className="space-y-2 text-[12.5px] text-muted">
            <li className="flex gap-2">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {L("队列 · 486 例（训练 340 / 内部验证 146）", "Cohort · 486 cases (340 training / 146 internal validation)")}
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {L("因子 · LASSO 保留 10 个 → 多因素入模 6 个", "Predictors · 10 retained by LASSO → 6 in the final model")}
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {L("难度 · EEF + 治疗强度 + NPVR，总分 > 3 为高难度", "Difficulty · EEF + treatment intensity + NPVR; score > 3 = high")}
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {L("性能 · AUC 0.903 / 0.923（95%CI 0.867–0.939 / 0.876–0.970）", "Performance · AUC 0.903 / 0.923 (95% CI 0.867–0.939 / 0.876–0.970)")}
            </li>
            <li className="flex gap-2">
              <span className="mt-[2px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {L("验证 · ROC · 校准 · 决策曲线；仅内部验证", "Validation · ROC · calibration · DCA; internal validation only")}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center font-mono text-[11px] text-muted">
        {L("© 2026 黄宇普 / HIFUweb. 保留所有权利", "© 2026 黄宇普 / HIFUweb. All rights reserved.")}
      </div>
    </footer>
  );
}
