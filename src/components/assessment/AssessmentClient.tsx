"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, Copy, Printer, RotateCcw, Sparkles, TriangleAlert, Link2 } from "lucide-react";
import { Controls } from "./Controls";
import { RiskGauge } from "./RiskGauge";
import { ContributionBars } from "./ContributionBars";
import { Nomogram } from "@/components/charts/Nomogram";
import { Reveal } from "@/components/site/Reveal";
import { Badge, Card } from "@/components/site/ui";
import { useEased } from "@/components/site/motion";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  EXAMPLE_CASES,
  RANGES,
  adviceFor,
  clamp,
  decisionHint,
  evaluate,
  type PatientInput,
} from "@/lib/model";

const DEFAULT: PatientInput = {
  age: RANGES.age.def,
  volume: RANGES.volume.def,
  wall: RANGES.wall.def,
  kishi: "II",
  t2: "hypoIso",
  t1: "mildMod",
};

const parse = (q: URLSearchParams): PatientInput => ({
  age: clamp(Number(q.get("age") ?? DEFAULT.age), RANGES.age.min, RANGES.age.max),
  volume: clamp(Number(q.get("volume") ?? DEFAULT.volume), RANGES.volume.min, RANGES.volume.max),
  wall: clamp(Number(q.get("wall") ?? DEFAULT.wall), RANGES.wall.min, RANGES.wall.max),
  kishi: (["I", "II", "III", "IV"].includes(q.get("kishi") ?? "") ? q.get("kishi") : DEFAULT.kishi) as PatientInput["kishi"],
  t2: q.get("t2") === "hyper" ? "hyper" : "hypoIso",
  t1: q.get("t1") === "marked" ? "marked" : "mildMod",
});

export function AssessmentClient() {
  const params = useSearchParams();
  const { locale, L, T } = useLocale();
  const [input, setInput] = useState<PatientInput>(DEFAULT);
  const [copied, setCopied] = useState<boolean | null>(null);
  const first = useRef(true);

  useEffect(() => {
    // URL 是评估结果的可分享来源：前进/后退或直接打开链接时，用查询参数恢复输入
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInput(parse(new URLSearchParams(params.toString())));
  }, [params]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const q = new URLSearchParams();
    q.set("age", String(input.age));
    q.set("volume", String(input.volume));
    q.set("wall", String(input.wall.toFixed(1)));
    q.set("kishi", input.kishi);
    q.set("t2", input.t2);
    q.set("t1", input.t1);
    window.history.replaceState(null, "", `?${q.toString()}`);
  }, [input]);

  const r = useMemo(() => evaluate(input, locale), [input, locale]);
  const shownPoints = useEased(r.points, 620);
  const shownLp = useEased(r.lp, 620);
  const advice = useMemo(() => adviceFor(input, locale), [input, locale]);
  const extrapolated = r.prob < 0.05 || r.prob > 0.95;

  const summary = [
    L("AM-HIFU 术前消融难度评估", "AM-HIFU pre-treatment ablation difficulty assessment"),
    L(
      `输入：年龄 ${input.age} 岁；子宫体积 ${input.volume} cm³；腹壁厚度 ${input.wall.toFixed(1)} mm；Kishi ${input.kishi}；T2WI ${input.t2 === "hyper" ? "高信号" : "低/等信号"}；T1WI ${input.t1 === "marked" ? "明显强化" : "轻/中度强化"}`,
      `Inputs: age ${input.age} y; uterine volume ${input.volume} cm³; abdominal wall ${input.wall.toFixed(1)} mm; Kishi ${input.kishi}; T2WI ${input.t2 === "hyper" ? "hyperintense" : "hypo-/iso-intense"}; T1WI ${input.t1 === "marked" ? "marked enhancement" : "mild-to-moderate enhancement"}`,
    ),
    L(
      `总分 ${r.points.toFixed(0)} 分 → 高消融难度概率 ${(r.prob * 100).toFixed(1)}%（${r.label ?? ""}）`,
      `Total ${r.points.toFixed(0)} points → probability of high difficulty ${(r.prob * 100).toFixed(1)}% (${r.label ?? ""})`,
    ),
    `${L("建议：", "Suggestion: ")}${decisionHint(r.prob, locale)}`,
  ].join("\n");

  const copy = async () => {
    const text = `${summary}${String.fromCharCode(10)}${L("链接", "Link")}: ${window.location.href}`;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false; // 非安全上下文 / 权限被拒时走兜底
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    setCopied(ok);
    setTimeout(() => setCopied(null), ok ? 1800 : 3400);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <Card hover={false}>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[13px] font-semibold">{L("术前输入项（6 个预测因子）", "Pre-treatment inputs (six predictors)")}</p>
              <Badge tone="neutral">{L("全部可在治疗前获得", "All available before treatment")}</Badge>
            </div>
            <p className="mb-2 text-[11.5px] leading-relaxed text-muted">
              {L("改变任一输入，右侧分值与概率会实时重算。", "Change any input and the points and probability on the right recompute instantly.")}
            </p>
            <Controls value={input} onChange={setInput} />
          </Card>

          <Card hover={false}>
            <p className="mb-3 flex items-center gap-2 text-[12.5px] font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              {L("示例病例", "Example cases")}
            </p>
            <div className="grid gap-2">
              {EXAMPLE_CASES.map((c, i) => (
                <button
                  key={T(c.name)}
                  type="button"
                  onClick={() => setInput(c.input)}
                  className="group flex items-start gap-3 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:shadow-[0_14px_30px_-24px_rgba(0,0,0,0.6)] active:translate-y-0"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border border-line font-mono text-[10.5px] text-muted transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0">
                    <p className="text-[12.5px] font-medium">{T(c.name)}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{T(c.note)}</p>
                  </span>
                  <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 -translate-x-1 text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copy}
                className="sheen inline-flex items-center gap-1.5 rounded-full bg-fg px-3.5 py-2 text-[12.5px] font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-20px_rgba(0,0,0,0.8)] active:translate-y-0"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? L("已复制", "Copied") : L("复制结论与分享链接", "Copy conclusion and share link")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] text-muted transition-colors hover:border-brand hover:text-brand"
              >
                <Printer className="h-3.5 w-3.5" /> {L("打印报告", "Print report")}
              </button>
              <button
                type="button"
                onClick={() => setInput(DEFAULT)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px] text-muted transition-colors hover:border-brand hover:text-brand"
              >
                <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" /> {L("重置", "Reset")}
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card hover={false}>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
              <RiskGauge prob={r.prob} color={r.color} label={r.label ?? ""} />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-surface-2/60 p-3">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{L("总分", "Total")}</p>
                    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{shownPoints.toFixed(0)}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{L("列线图 0 – 260 分", "Nomogram 0 – 260 pts")}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-2/60 p-3">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{L("线性预测值", "Linear predictor")}</p>
                    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{shownLp.toFixed(2)}</p>
                    <p className="mt-0.5 text-[11px] text-muted">logit({L("高难度", "high difficulty")})</p>
                  </div>
                </div>
                <div className="rounded-xl border border-brand/30 bg-brand-soft px-3.5 py-3">
                  <p className="text-[12.5px] leading-relaxed">{decisionHint(r.prob, locale)}</p>
                </div>
                {extrapolated && (
                  <div className="flex gap-2 rounded-xl border border-mid/30 bg-mid/10 px-3.5 py-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-mid" />
                    <p className="text-[11.5px] leading-relaxed text-muted">
                      {L("当前预测概率超出列线图 Risk 轴显示范围（约 0.1 – 0.9），结果属于模型外推，仅作敏感性分析参考。", "This probability lies outside the nomogram’s Risk axis (about 0.1 – 0.9), so the result is an extrapolation, for sensitivity analysis only.")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <p className="mb-3 text-[12.5px] font-semibold">{L("各因子分值贡献", "Point contribution by factor")}</p>
            <ContributionBars factors={r.factors} />
          </Card>

          <Card hover={false}>
            <p className="mb-3 text-[12.5px] font-semibold">{L("针对性建议（按主导风险因子）", "Targeted suggestions (by dominant risk factor)")}</p>
            <ul className="space-y-2.5">
              {advice.map((a) => (
                  <li
                    key={T(a.factor)}
                    className="slide border-l-2 border-brand/50 pl-3"
                  >
                    <p className="text-[12.5px] font-medium">{T(a.factor)}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{a.advice}</p>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </div>

      <Reveal variant="mask" className="lg:col-span-2">
        <Card hover={false} className="mt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold">{L("交互式列线图总览", "Interactive nomogram overview")}</p>
            <div className="flex gap-2">
              <Badge>Points 0 – 100</Badge>
              <Badge tone="neutral">Total 0 – 260</Badge>
            </div>
          </div>
          <p className="mb-3 text-[11.5px] leading-relaxed text-muted">
            {L("读数方式与纸质列线图一致：每个变量在当前取值处向上作垂线读取 Points 分值，累加得总分，再由总分向下作垂线读取高消融难度概率。图中虚线即为当前病例的读数路径。", "Read it like a paper nomogram: for each variable draw a vertical line up to the Points scale, sum the points, then drop a line from the total to the probability of high difficulty. The dashed line is the current case.")}
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <Nomogram input={input} points={r.points} prob={r.prob} />
            </div>
          </div>
        </Card>
      </Reveal>

      <div className="mt-6 rounded-2xl border border-line bg-surface-2/60 px-4 py-3.5 lg:col-span-2">
        <p className="text-[11.5px] leading-relaxed text-muted">
          <span className="font-semibold text-fg">{L("工具说明：", "About this tool: ")}</span>
          {L("本工具的分值与概率映射由论文图3 列线图刻度逆向标定得到，与列线图读数等价（AUC 训练集 0.903、内部验证集 0.923）。它用于", "Points and probabilities are reverse-calibrated from the Figure 3 nomogram scales, equivalent to reading the nomogram (AUC 0.903 training, 0.923 internal validation). It supports ")}
          <strong>{L("术前风险分层与沟通", "pre-treatment risk stratification and counselling")}</strong>
          {L("，不预测并发症、不替代医师判断；最终治疗决策需结合完整病史、影像与多学科意见。", "; it does not predict complications and does not replace clinical judgement. Final decisions need the full history, imaging and multidisciplinary review.")}
        </p>
      </div>

        {/* 读屏播报：总分与概率随输入实时更新 */}
        <p className="sr-only" role="status" aria-live="polite">
          {L(
            `总分 ${r.points.toFixed(0)} 分，高消融难度概率 ${(r.prob * 100).toFixed(1)}%，${r.label ?? ""}`,
            `Total ${r.points.toFixed(0)} points, probability of high difficulty ${(r.prob * 100).toFixed(1)}% (${r.label ?? ""})`,
          )}
        </p>

        {copied !== null &&
          typeof document !== "undefined" &&
          createPortal(
            // 走 portal：避免祖先的 transform 让 fixed 定位失效
            <>
            <div
              className={cn(
                "rise fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border bg-surface px-4 py-2.5 text-[12.5px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)]",
                copied ? "border-brand/40" : "border-mid/50",
              )}
              role="status"
            >
              <span className={cn("grid h-5 w-5 place-items-center rounded-full text-on-brand", copied ? "bg-brand" : "bg-mid")}>
                {copied ? <Check className="h-3 w-3" /> : <TriangleAlert className="h-3 w-3" />}
              </span>
              {copied
                ? L("结论与分享链接已复制到剪贴板", "Conclusion and share link copied to clipboard")
                : L("浏览器阻止了剪贴板写入，请手动选择文本", "Clipboard blocked — select the text manually")}
              {copied && <Link2 className="h-3.5 w-3.5 text-brand" />}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
