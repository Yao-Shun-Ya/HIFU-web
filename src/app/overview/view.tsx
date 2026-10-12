"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Layers3, Stethoscope, Target } from "lucide-react";
import { RocCurve } from "@/components/charts/RocCurve";
import { KishiTypes } from "@/components/charts/KishiTypes";
import { Reveal } from "@/components/site/Reveal";
import { Card, Eyebrow, Heading, Section, Stat } from "@/components/site/ui";
import {
  APPLICATIONS,
  FACTORS,
  INNOVATIONS,
  PIPELINE,
  PROBLEM,
  PROBLEM_NOTE,
} from "@/lib/data";
import { useLocale } from "@/lib/i18n";

const ICONS = [BrainCircuit, Layers3, Target, Stethoscope];

export function OverviewView() {
  const { locale, L, T } = useLocale();

  return (
    <>
      <Section className="pb-4 pt-10">
        <Eyebrow>{L("成果总览 · Overview", "Overview")}</Eyebrow>
        <Heading
          title={L(
            "一篇论文，六个层次讲清楚",
            "One paper, explained across six layers",
          )}
          desc={L(
            "临床问题 → 方法学创新 → 技术路线 → 模型性能 → 预测因子 → 应用场景；交互工具见「术前评估」，完整证据见「结果与证据」。",
            "Clinical problem → methodological innovations → pipeline → model performance → predictors → clinical applications. The interactive tool lives under “Risk Tool”; full evidence under “Results”.",
          )}
        />
      </Section>

      <Section id="problem" className="py-8">
        <Eyebrow index={1}>{L("01 · 临床问题", "01 · Clinical problem")}</Eyebrow>
        <Heading
          title={L(
            "HIFU 治疗 AM：不是“能不能做”，而是“这一次有多少把握”",
            "HIFU for AM is not “can it be done” but “how much certainty do we have this time”",
          )}
          desc={L(
            "AM 的 HIFU 疗效高度依赖靶区能否被充分覆盖与凝固。既往研究多关注疗效与安全性指标，对“哪些病例技术上难以完成有效消融”缺乏术前可操作的量化工具。",
            "HIFU effectiveness for AM depends on whether the target can be fully covered and coagulated. Previous work focused on efficacy and safety endpoints, with no operable pre-operative tool for identifying cases that are technically hard to ablate.",
          )}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROBLEM.map((p, i) => (
            <Reveal variant="scale" key={i} index={i}>
              <Card className="h-full">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[14px] font-semibold">{T(p.t)}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{T(p.d)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal variant="left" index={3}>
          <blockquote className="mt-6 border-l-2 border-brand pl-4 text-[14px] leading-relaxed text-muted">
            {T(PROBLEM_NOTE)}
          </blockquote>
        </Reveal>
      </Section>

      <Section id="innovation" className="py-8">
        <Eyebrow index={1}>{L("02 · 创新点", "02 · Innovations")}</Eyebrow>
        <Heading
          title={L("四项相互衔接的方法学创新", "Four interlocking methodological innovations")}
          desc={L("从结局定义到模型验证，形成一条可复现的技术路线。", "From outcome definition to model validation: one reproducible pipeline.")}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {INNOVATIONS.map((it, i) => {
            const Icon = ICONS[i] ?? Target;
            return (
              <Reveal key={it.n} index={i}>
                <Card className="h-full">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <p className="text-[14.5px] font-semibold">{T(it.t)}</p>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted">{T(it.d)}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section id="pipeline" className="py-8">
        <Eyebrow index={1}>{L("03 · 技术路线", "03 · Pipeline")}</Eyebrow>
        <Heading
          title={L("五步构建路径：从 1032 例筛查到可视化列线图", "Five steps: from 1,032 screened cases to a visual nomogram")}
        />
        <div className="mt-8 grid gap-3 md:grid-cols-5">
          {PIPELINE.map((s, i) => (
            <Reveal key={i} index={i}>
              <div className="surface relative h-full rounded-2xl p-4">
                <span className="absolute right-3 top-2 font-mono text-[26px] font-semibold text-line-strong">
                  {i + 1}
                </span>
                <p className="text-[13px] font-semibold">{T(s.s)}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">{T(s.d)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section id="performance" className="py-8">
        <Eyebrow index={1}>{L("04 · 模型性能", "04 · Model performance")}</Eyebrow>
        <Heading
          title={L("区分度：训练集 AUC 0.903，内部验证 AUC 0.923", "Discrimination: AUC 0.903 in training, 0.923 in internal validation")}
          desc={L(
            "验证集 AUC 高于训练集，提示模型未出现明显过拟合；校准曲线接近对角线，DCA 显示在较宽的阈值概率区间内可获得正向净获益。",
            "The validation AUC exceeds the training AUC, arguing against overfitting; the calibration curve tracks the diagonal and DCA shows positive net benefit over a wide range of threshold probabilities.",
          )}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
          <Reveal variant="mask">
            <Card hover={false} className="h-full">
              <RocCurve
                curves={[
                  { label: L("训练集 (n=340)", "Training (n=340)"), auc: 0.903, color: "var(--brand)" },
                  { label: L("内部验证 (n=146)", "Internal validation (n=146)"), auc: 0.923, color: "var(--brand2)", dash: "6 4" },
                ]}
              />
              <p className="mt-2 text-center text-[11.5px] text-muted">
                {L(
                  "ROC 曲线依据论文报告的 AUC 以双正态模型绘制，用于展示区分度水平。",
                  "ROC curves are drawn from the reported AUCs with a binormal model, shown to illustrate discrimination.",
                )}
              </p>
            </Card>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal variant="scale" index={1}>
              <Card className="h-full">
                <Stat v="0.903" k={L("训练集 AUC", "Training AUC")} sub="95%CI 0.867 – 0.939" />
              </Card>
            </Reveal>
            <Reveal variant="scale" index={2}>
              <Card className="h-full">
                <Stat v="0.923" k={L("验证集 AUC", "Validation AUC")} sub="95%CI 0.876 – 0.970" />
              </Card>
            </Reveal>
            <Reveal variant="scale" index={3}>
              <Card className="h-full">
                <Stat v="6" k={L("进入模型的因子", "Variables retained")} sub="13 → 10 → 6" />
              </Card>
            </Reveal>
            <Reveal variant="scale" index={4}>
              <Card className="h-full">
                <Stat v="0–6" k={L("消融难度总分", "Difficulty score")} sub={L(">3 分为高难度", ">3 = high difficulty")} />
              </Card>
            </Reveal>
            <Reveal index={5}>
              <Card hover={false} className="sm:col-span-2">
                <p className="text-[13px] leading-relaxed text-muted">
                  {L(
                    "决策曲线分析显示，按阈值概率选择干预策略时，列线图在",
                    "Decision curve analysis: when choosing an intervention by threshold probability, the nomogram yields a higher net benefit than the strategies “treat all as difficult” and “treat none as difficult” across roughly ",
                  )}
                  <strong className="text-fg">{L(" 约 5% – 80%（训练集）", "5%–80% (training)")}</strong>
                  {L(" 与", " and ")}
                  <strong className="text-fg">{L(" 约 5% – 75%（验证集）", "5%–75% (validation)")}</strong>
                  {L(" 的阈值区间内净获益高于“全部按高难度处理”与“全部按低难度处理”两种极端策略。", ".")}
                </p>
                <Link
                  href="/results"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand"
                >
                  {L("查看完整验证结果", "See the full validation results")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Card>
            </Reveal>
          </div>
        </div>
      </Section>
      <Section id="factors" className="py-8">
        <Eyebrow index={1}>{L("05 · 六个预测因子", "05 · Six predictors")}</Eyebrow>
        <Heading
          title={L("全部因子在治疗前即可获得", "Every variable is available before treatment")}
          desc={L(
            "一次盆腔 MRI（T1WI/T2WI + 增强）与常规体格检查即可完成输入，无需额外检查项目。",
            "One pelvic MRI (T1WI/T2WI with contrast) plus routine examination provides all inputs; no additional testing is required.",
          )}
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACTORS.map((f, i) => (
            <Reveal key={i} index={i}>
              <Card className="h-full">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold">{T(f.k)}</p>
                  <span className="font-mono text-[11px] text-brand">
                    {L(`最高 ${f.max} 分`, `max ${f.max} pts`)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  {locale === "zh" ? f.k.en : f.k.zh}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{T(f.why)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal variant="mask" index={6}>
          <div className="mt-6">
            <KishiTypes />
          </div>
        </Reveal>
      </Section>

      <Section id="application" className="py-8">
        <Eyebrow index={1}>{L("06 · 应用场景", "06 · Applications")}</Eyebrow>
        <Heading
          title={L("从门诊沟通到术中策略：模型如何嵌入工作流", "From clinic counselling to intra-operative strategy")}
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {APPLICATIONS.map((a, i) => (
            <Reveal variant="right" key={i} index={i}>
              <Card className="h-full">
                <p className="mb-2 text-[14px] font-semibold">{T(a.t)}</p>
                <p className="text-[12.5px] leading-relaxed text-muted">{T(a.d)}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-10">
        <Reveal>
          <div className="surface flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
            <p className="text-[13.5px] text-muted">
              {L("想看具体图表与全部验证结果？", "Want the charts and the full validation?")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/results" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] transition-colors hover:border-brand/40 hover:text-brand">
                {L("结果与证据", "Results")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/methods" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-[13px] transition-colors hover:border-brand/40 hover:text-brand">
                {L("研究方法", "Methods")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
