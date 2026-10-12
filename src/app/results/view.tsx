"use client";

import Image from "next/image";
import { Badge, Card, DataTable, Eyebrow, Heading, Section } from "@/components/site/ui";
import { Reveal } from "@/components/site/Reveal";
import { CohortFlow } from "@/components/charts/CohortFlow";
import { RocCurve } from "@/components/charts/RocCurve";
import { CalibrationCurve } from "@/components/charts/CalibrationCurve";
import { DcaCurve } from "@/components/charts/DcaCurve";
import { ForestPlot } from "@/components/charts/ForestPlot";
import { Nomogram } from "@/components/charts/Nomogram";
import { useLocale } from "@/lib/i18n";
import { LIMITS, LASSO_FACTORS } from "@/lib/data";
import { OR_TABLE, evaluate } from "@/lib/model";

const SAMPLE = (() => {
  const input = { age: 33, volume: 420, wall: 32, kishi: "IV", t2: "hyper", t1: "marked" } as const;
  const r = evaluate({ ...input });
  return { input: { ...input }, points: r.points, prob: r.prob };
})();

export function ResultsView() {
  const { L, T } = useLocale();

  return (
    <Section className="pt-10">
      <Eyebrow>{L("Results · 结果与证据", "Results and evidence")}</Eyebrow>
      <Heading
        title={L("486 例队列，6 个因子，AUC 0.903 / 0.923", "A 486-patient cohort, six factors, AUC 0.903 / 0.923")}
        desc={L("以下图表对应论文图1—图6 与表1—表4；在线曲线为按论文报告指标绘制的示意图，原始图表同时保留可查。", "The figures below correspond to Figures 1–6 and Tables 1–4 of the paper; the interactive curves are schematic reconstructions, and the original figures are kept for reference.")}
      />

      <div className="mt-8">
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">
          {L("图1 · 患者筛选", "Figure 1 · Patient screening")}
        </p>
        <CohortFlow />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Reveal variant="mask">
          <Card hover={false} className="h-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{L("图4A · ROC 训练集", "Figure 4A · ROC, training")}</p>
            <RocCurve curves={[{ label: L("训练集", "Training"), auc: 0.903, color: "var(--brand)" }]} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {L("AUC = 0.903（95%CI 0.867–0.939）；曲线按双正态模型由 AUC 反推绘制。", "AUC = 0.903 (95%CI 0.867–0.939); the curve is reconstructed from the AUC under a binormal model.")}
            </p>
          </Card>
        </Reveal>
        <Reveal variant="scale" index={1}>
          <Card hover={false} className="h-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand2">{L("图4B · ROC 内部验证", "Figure 4B · ROC, internal validation")}</p>
            <RocCurve
              curves={[{ label: L("内部验证集", "Internal validation"), auc: 0.923, color: "var(--brand2)", dash: "6 4" }]}
            />
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {L("AUC = 0.923（95%CI 0.876–0.970）；验证集略高于训练集，提示未出现明显过拟合。", "AUC = 0.923 (95%CI 0.876–0.970); validation slightly exceeds training, arguing against meaningful overfitting.")}
            </p>
          </Card>
        </Reveal>
        <Reveal variant="mask" index={2}>
          <Card hover={false} className="h-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{L("图5 · 校准曲线", "Figure 5 · Calibration")}</p>
            <CalibrationCurve
              curves={[
                { label: L("训练集", "Training"), slope: 1.12, color: "var(--brand)" },
                { label: L("内部验证集", "Internal validation"), slope: 1.06, color: "var(--brand2)", dash: "6 4" },
              ]}
            />
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {L("对角线代表理想校准；曲线贴近对角线说明预测概率与实际观察比例一致性较好。", "The diagonal is perfect calibration; curves close to it indicate good agreement between predicted and observed proportions.")}
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal variant="scale" index={3}>
          <Card hover={false} className="h-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand">{L("图6A · DCA 训练集", "Figure 6A · DCA, training")}</p>
            <DcaCurve auc={0.903} prevalence={84 / 340} label={L("训练集", "Training")} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {L("论文报告：阈值概率约 ", "As reported: net benefit is positive for threshold probabilities of roughly ")}
              <strong className="text-fg">5% – 80%</strong>
              {L(" 区间内模型净获益为正。上图按 AUC 0.903 与训练集高难度患病率 24.7% 做双正态模拟，用于展示净获益随阈值变化的趋势。", ". The plot above is a binormal simulation using AUC 0.903 and a training-set high-difficulty prevalence of 24.7%, intended to show how net benefit changes with the threshold.")}
            </p>
          </Card>
        </Reveal>
        <Reveal variant="scale" index={4}>
          <Card hover={false} className="h-full">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brand2">{L("图6B · DCA 内部验证", "Figure 6B · DCA, internal validation")}</p>
            <DcaCurve auc={0.923} prevalence={30 / 146} label={L("内部验证集", "Internal validation")} />
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              {L("论文报告：阈值概率约 ", "As reported: net benefit over roughly ")}
              <strong className="text-fg">5% – 75%</strong>
              {L(" 区间内有净获益；阴影区为模拟曲线净获益为正的阈值范围。", " of thresholds; the shaded band marks the range where the simulated curve has positive net benefit.")}
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-10">
        <Eyebrow index={1}>{L("变量效应量", "Effect sizes")}</Eyebrow>
        <Heading
          title={L("优势比（OR）森林图", "Odds-ratio forest plot")}
          desc={L("由列线图分值刻度换算得到（OR = exp(该因子最大分值 × 每分 logit 变化)），反映各因子对高消融难度的相对贡献。", "Derived from the nomogram point scales (OR = exp(max points × logit change per point)), showing each factor’s relative contribution to high ablation difficulty.")}
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Reveal variant="left">
            <Card hover={false} className="h-full">
              <ForestPlot />
              <p className="mt-2 text-[11.5px] text-muted">{L("横轴为对数尺度；菱形为点估计，横线为 95%CI。", "Logarithmic axis; diamonds are point estimates, bars are 95%CIs.")}</p>
            </Card>
          </Reveal>
          <Reveal variant="right" index={1}>
            <div className="h-full">
              <DataTable
                head={[L("变量", "Variable"), "OR", L("95%CI", "95%CI")]}
                rows={OR_TABLE.map((d) => [T(d.var), d.or.toFixed(2), `${d.lo.toFixed(2)} – ${d.hi.toFixed(2)}`])}
                caption={L("区间按 OR × exp(±0.342·SE) 由点估计近似给出，用于可视化相对强度。", "Intervals are approximated from the point estimates as OR × exp(±0.342·SE), for visualising relative strength.")}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-10">
        <Eyebrow index={2}>{L("图3 · 列线图", "Figure 3 · Nomogram")}</Eyebrow>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal variant="left">
            <Card hover={false} className="flex h-full flex-col">
              <p className="mb-2 text-[12px] font-semibold">{L("论文原始图3", "Original Figure 3")}</p>
              <div className="my-auto">
              <Image
                src="/figures/nomogram-original.png"
                alt={L("论文图3：子宫腺肌病高消融难度预测列线图（原始）", "Figure 3: nomogram predicting high HIFU ablation difficulty in adenomyosis (original)")}
                width={1268}
                height={689}
                className="w-full rounded-xl border border-line"
              />
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
                {L(
                  "读法：在每个变量处向上作垂线读取 Points，各项相加得总分，再由总分轴向下读出高难度概率。原图取自论文、未重绘；本站复现图与它逐项对应。",
                  "How to read: draw a vertical line at each variable to read its Points, sum them, then drop from the total-points scale to the probability scale. The image is the paper's original (not redrawn); the reconstruction beside it maps to it item by item.",
                )}
              </p>
            </Card>
          </Reveal>
          <Reveal variant="right" index={1}>
            <Card hover={false} className="h-full">
              <p className="mb-2 text-[12px] font-semibold">{L("本站复现（示例病例）", "Reconstructed here (example case)")} · 33{L("岁", " y")} / Kishi IV</p>
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <Nomogram input={SAMPLE.input} points={SAMPLE.points} prob={SAMPLE.prob} showGuides />
                </div>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                {L("刻度、变量与总分/概率轴均按原始图3 的几何比例重建，可直接与左图逐项对照。", "Scales, variables and the total-points / probability axes are rebuilt to the geometry of the original figure and can be compared item by item with the left image.")}
              </p>
            </Card>
          </Reveal>
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Reveal variant="mask">
          <Card hover={false} className="flex h-full flex-col">
            <p className="mb-2 text-[12px] font-semibold">{L("论文原始图1 · 患者筛选流程", "Original Figure 1 · Cohort flow")}</p>
            <div className="my-auto">
            <Image
              src="/figures/cohort-flow-original.png"
              alt={L("论文图1：患者筛选流程图（原始）", "Figure 1: patient screening flow chart (original)")}
              width={865}
              height={487}
              className="w-full rounded-xl border border-line"
            />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              {L(
                "原图来自论文；本页上方的流程图按同一数字重绘（1032 → 排除 546 → 486），可对照阅读。",
                "The image is from the paper; the flow diagram above is redrawn with the same numbers (1,032 → 546 excluded → 486) for comparison.",
              )}
            </p>
          </Card>
        </Reveal>
        <Reveal variant="scale" index={1}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[12px] font-semibold">{L("变量筛选结果（LASSO 保留 10 个）", "Variable selection (10 retained by LASSO)")}</p>
            <ol className="mb-4 space-y-1.5 text-[12.5px] text-muted">
              {LASSO_FACTORS.map((f, i) => (
                <li key={T(f)} className="flex gap-3">
                  <span className="font-mono text-[11px] text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span>{T(f)}</span>
                </li>
              ))}
            </ol>
            <p className="text-[12px] leading-relaxed text-muted">
              {L("其中年龄、子宫体积、腹壁厚度、Kishi 分型、T2WI 信号强度、T1WI 增强程度在多因素 Logistic 回归中保持独立，进入最终列线图；病灶中心距腹壁距离、子宫位置、T2WI/T1WI 信号均匀程度未进入最终模型。", "Age, uterine volume, wall thickness, Kishi type, T2WI signal intensity and T1WI enhancement remained independent in multivariable logistic regression and entered the final nomogram; lesion-to-wall distance, uterine position and signal homogeneity did not.")}
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-10">
        <Eyebrow index={3}>{L("局限与边界", "Limitations and boundaries")}</Eyebrow>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {LIMITS.map((l, i) => (
            <Reveal key={T(l)} index={i}>
              <div className="flex h-full gap-3 rounded-2xl border border-line bg-surface-2/50 px-4 py-3.5">
                <Badge tone="warn">{String(i + 1).padStart(2, "0")}</Badge>
                <p className="text-[12.5px] leading-relaxed text-muted">{T(l)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
