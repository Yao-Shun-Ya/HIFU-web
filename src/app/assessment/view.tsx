"use client";

import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { AssessmentClient } from "@/components/assessment/AssessmentClient";
import { Badge, Card, Eyebrow, Heading, Section } from "@/components/site/ui";
import { useLocale } from "@/lib/i18n";

export function AssessmentView() {
  const { L } = useLocale();

  return (
    <Section className="pt-10">
      <Eyebrow>{L("诊断工具 · Diagnostic Tool", "Diagnostic tool")}</Eyebrow>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading title={L("AM-HIFU 术前消融难度评估", "AM-HIFU pre-treatment ablation difficulty")} />
        <div className="flex flex-wrap gap-2">
          <Badge>{L("实时重算", "Live recompute")}</Badge>
          <Badge>{L("可分享链接", "Shareable link")}</Badge>
          <Badge>{L("可打印报告", "Printable report")}</Badge>
        </div>
      </div>

      <div className="mt-8">
        <Suspense
          fallback={
            <Card hover={false}>
              <div className="h-64 animate-pulse rounded-xl bg-surface-2" />
            </Card>
          }
        >
          <AssessmentClient />
        </Suspense>
      </div>

      <div className="mt-8 flex gap-3 rounded-2xl border border-high/25 bg-high/6 px-4 py-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-high" />
        <p className="text-[12px] leading-relaxed text-muted">
          <strong className="text-fg">{L("使用边界：", "Scope of use: ")}</strong>
          {L("本工具输出的是「技术难度」风险分层，而非疗效或并发症预测；模型来自单中心回顾性队列并仅完成内部验证，尚未在外部队列验证。任何治疗决策须由具备 HIFU 资质的临床团队结合完整临床资料作出。", "The output is a technical-difficulty risk stratification, not a prediction of outcome or complications; the model comes from a single-centre retrospective cohort with internal validation only and has not been externally validated. Any treatment decision must be made by a qualified HIFU clinical team using the complete clinical picture.")}
        </p>
      </div>
    </Section>
  );
}
