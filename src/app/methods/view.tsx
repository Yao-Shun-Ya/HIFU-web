"use client";

import { Card, DataTable, Eyebrow, Formula, Heading, Section } from "@/components/site/ui";
import { Reveal } from "@/components/site/Reveal";
import { useLocale } from "@/lib/i18n";
import { EXCLUSIONS, LASSO_FACTORS } from "@/lib/data";

export function MethodsView() {
  const { L, T } = useLocale();

  return (
    <Section className="pt-10">
      <Eyebrow>{L("Methods · 研究方法", "Methods")}</Eyebrow>
      <Heading
        title={L("单中心回顾性队列 · 从结局定义到模型验证", "A single-centre retrospective cohort — from outcome definition to validation")}
        desc={L("模型的可靠性首先取决于结局定义是否贴近真实操作难度。本研究先定义“消融难度”，再筛选术前因子，最后做三重验证。", "A nomogram is only as reliable as its outcome definition. This study first quantified ablation difficulty, then screened pre-treatment factors, and finally validated the model three ways.")}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("1 · 研究设计与对象", "1 · Design and participants")}</p>
            <ul className="space-y-2 text-[13px] leading-relaxed text-muted">
              <li>{L("单中心回顾性研究，连续筛选 2016 年 3 月—2024 年 3 月诊断为子宫腺肌病（AM）并接受 HIFU 消融治疗的患者。", "Single-centre retrospective study; patients diagnosed with adenomyosis (AM) and treated with HIFU ablation between March 2016 and March 2024 were screened consecutively.")}</li>
              <li>{L("共筛选 1032 例，排除 546 例，最终纳入 486 例；按约 7:3 随机分为训练集（340 例）与内部验证集（146 例）。", "1032 patients screened, 546 excluded, 486 included; randomised ~7:3 into a training set (340) and an internal validation set (146).")}</li>
              <li>{L("治疗前 1 周内完成盆腔 MRI 平扫 + 增强，记录腹壁厚度、子宫体积与位置、Kishi 分型、病灶体积与位置、T1/T2 信号强度与均匀程度等。", "Plain and contrast pelvic MRI within one week before treatment; abdominal wall thickness, uterine volume and position, Kishi type, lesion volume and position, and T1/T2 signal intensity and homogeneity were recorded.")}</li>
              <li>{L("治疗采用 JC200 型聚焦超声肿瘤治疗系统，实时超声监控下定位与消融；治疗结束后行 CEUS 即时评估，术后 24 h 增强 MRI 测量非灌注体积（NPV）。", "Treatment used a JC200 focused-ultrasound system with real-time ultrasound monitoring; CEUS immediately after treatment and contrast-enhanced MRI at 24 h measured the non-perfusion volume (NPV).")}</li>
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {EXCLUSIONS.map((e) => (
                <div key={T(e.r)} className="rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12px]">
                  <span className="text-muted">{T(e.r)}</span>
                  <span className="ml-2 font-mono text-high">n={e.n}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal variant="left" index={1}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("2 · 消融难度的量化（核心创新）", "2 · Quantifying ablation difficulty (the core innovation)")}</p>
            <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
              {L("单一 NPVR 无法反映能量消耗与操作复杂度。本研究将三项指标各按等级赋 0–2 分，合计 0–6 分；总分 > 3 分定义为", "NPVR alone cannot reflect energy expenditure or procedural complexity. Each of three indicators was therefore graded 0–2 points (0–6 in total); a total above ")}
              <strong className="text-fg">{L("高消融难度", "3 points")}</strong>
              {L("。", " defined high ablation difficulty.")}
            </p>
            <DataTable
              head={[L("指标", "Indicator"), L("0 分", "0 pts"), L("1 分", "1 pt"), L("2 分", "2 pts")]}
              rows={[
                [L("EEF（能效因子）", "EEF (energy efficiency factor)"), "< Q2", "Q2 ≤ EEF < Q3", "≥ Q3"],
                [L("治疗强度（s/h）", "Treatment intensity (s/h)"), "< Q2", "Q2 ≤ (s/h) < Q3", "≥ Q3"],
                [L("NPVR（非灌注体积率）", "NPVR (non-perfusion volume rate)"), "≥ 70%", "50% ≤ NPVR < 70%", "< 50%"],
              ]}
              caption={L("表1 消融难度评分（论文表1）。EEF 与治疗强度的 Q2/Q3 截断值依训练集分布确定并外推至验证集；NPVR 越高代表消融越充分，故计 0 分。", "Table 1 — ablation difficulty score (paper Table 1). The Q2/Q3 cut-offs for EEF and treatment intensity were derived from the training distribution and applied to the validation set; a higher NPVR means more complete ablation and therefore scores 0.")}
            />
            <div className="mt-4 space-y-2">
              <Formula note={L("η 为聚焦系数（取 0.7），P 为超声功率（W），t 为辐照时间（s），V 为 NPV（mm³）。", "η is the focusing coefficient (0.7), P the acoustic power (W), t the irradiation time (s), V the NPV (mm³).")}>
                EEF = η × P × t / V&nbsp;&nbsp;(J/mm³)
              </Formula>
              <Formula note={L("反映单位治疗时间内的有效辐照时间；越长代表操作越耗时。", "Effective irradiation time per hour of treatment; longer means a more time-consuming procedure.")}>
                {L("治疗强度 (s/h) = 辐照时间(s) ÷ [治疗时间(min) ÷ 60]", "Treatment intensity (s/h) = irradiation (s) ÷ [treatment time (min) ÷ 60]")}
              </Formula>
              <Formula note={L("病灶体积与 NPV 均由三维径线按椭球公式计算。", "Lesion volume and NPV are both computed from three orthogonal diameters using the ellipsoid formula.")}>
                V′ = π/6 × D1 × D2 × D3&nbsp;&nbsp;;&nbsp;&nbsp;NPVR = NPV ÷ {L("病灶体积", "lesion volume")} × 100%
              </Formula>
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal variant="right" index={2}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("3 · 变量筛选：LASSO → 多因素 Logistic", "3 · Variable selection: LASSO → multivariable logistic")}</p>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-full border border-line bg-surface-2 px-3 py-1.5 font-mono">{L("候选变量 13", "13 candidates")}</span>
              <span className="text-muted">→</span>
              <span className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 font-mono text-brand">LASSO · λ = 0.034 · 10</span>
              <span className="text-muted">→</span>
              <span className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 font-mono text-brand">{L("最终 6", "6 final")}</span>
            </div>
            <ul className="mb-4 space-y-2 text-[12.5px] leading-relaxed text-muted">
              <li>{L("先以单因素分析（P < 0.10）筛出 13 个候选变量；", "Univariable analysis (P < 0.10) first yielded 13 candidate variables;")}</li>
              <li>{L("LASSO 逻辑回归经 10 折交叉验证，按 1-SE 准则取 λ = 0.034，保留 10 个变量；", "LASSO logistic regression with 10-fold cross-validation kept 10 variables at λ = 0.034 (1-SE rule);")}</li>
              <li>{L("再经多因素 Logistic 回归锁定 6 个独立预测因子并构建列线图。", "multivariable logistic regression then retained six independent predictors for the nomogram.")}</li>
            </ul>
            <div className="grid grid-cols-2 gap-2">
              {LASSO_FACTORS.map((f) => (
                <div key={T(f)} className="rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12px] text-muted">
                  {T(f)}
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal variant="mask" index={3}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("4 · 模型评价三重验证", "4 · Three-part model evaluation")}</p>
            <ul className="space-y-3 text-[12.5px] leading-relaxed text-muted">
              <li>
                <strong className="text-fg">{L("区分度：", "Discrimination: ")}</strong>
                {L("ROC 曲线与 AUC（含 95%CI），训练集 0.903（0.867–0.939）、内部验证 0.923（0.876–0.970）。", "ROC curves and AUC with 95%CI — 0.903 (0.867–0.939) in the training set and 0.923 (0.876–0.970) in internal validation.")}
              </li>
              <li>
                <strong className="text-fg">{L("校准度：", "Calibration: ")}</strong>
                {L("校准曲线评估预测概率与实际观察概率的一致性，曲线越贴近对角线代表校准越好。", "Calibration curves compare predicted with observed probabilities; the closer to the diagonal, the better the calibration.")}
              </li>
              <li>
                <strong className="text-fg">{L("临床实用性：", "Clinical utility: ")}</strong>
                {L("决策曲线分析（DCA）比较“模型指导”“全部按高难度处理”“全部按低难度处理”三种策略的净获益。", "Decision curve analysis comparing net benefit under model guidance, treat-all and treat-none strategies.")}
              </li>
              <li>
                <strong className="text-fg">{L("软件与检验水准：", "Software and significance level: ")}</strong>
                {L("R 4.5.2；连续变量以 x̄±s 或 M(QR) 表示，分类变量以 n(%) 表示；组间比较采用 t 检验、χ² 检验或秩和检验；双侧 P < 0.05 为差异有统计学意义。", "R 4.5.2; continuous variables as mean ± SD or median (IQR), categorical as n (%); comparisons by t test, χ² test or rank-sum test; two-sided P < 0.05 was significant.")}
              </li>
            </ul>
            <div className="mt-4 rounded-xl border border-mid/30 bg-mid/10 px-3.5 py-3">
              <p className="text-[11.5px] leading-relaxed text-muted">
                <strong className="text-fg">{L("可复现性说明：", "Reproducibility note: ")}</strong>
                {L("原论文正文未列出各因子的回归系数表，本站的评分与概率映射由图3 列线图刻度", "The paper does not print a coefficient table, so the points and probability mapping on this site were ")}
                <strong className="text-fg">{L("逆向标定", "reverse-calibrated")}</strong>
                {L("（每分对应 logit 变化 0.0508，logit = 0 对应总分 178.7），与列线图读数等价；ROC / 校准 / DCA 曲线为按论文报告的 AUC、患病率与阈值区间绘制的示意图，非逐例原始数据重算。", " from the Figure 3 nomogram scales (0.0508 logit per point; logit 0 at 178.7 points), which is equivalent to reading the nomogram. The ROC / calibration / DCA curves are schematic: drawn from the reported AUCs, prevalence and threshold ranges rather than recomputed from individual data.")}
              </p>
            </div>
          </Card>
        </Reveal>
      </div>
    </Section>
  );
}
