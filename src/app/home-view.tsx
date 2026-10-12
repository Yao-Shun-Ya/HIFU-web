"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { Reveal } from "@/components/site/Reveal";
import { useLocale } from "@/lib/i18n";

export function HomeView() {
  const { L } = useLocale();
  return (
    <>
      <Hero />

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-16">
        <Reveal variant="mask">
          <div className="surface relative overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-12">
            <div className="grid-bg absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="text-balance text-[22px] font-semibold sm:text-[28px]">
                {L("把列线图变成可操作的术前评估", "Turn the nomogram into a workable pre-op assessment")}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
                {L(
                  "输入 6 项术前指标，实时得到总分、高消融难度概率与针对性建议，并可打印用于术前沟通。",
                  "Enter six pre-treatment variables to obtain total points, the probability of high ablation difficulty and targeted suggestions — printable for pre-operative counselling.",
                )}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[14px] font-semibold text-on-brand transition-transform hover:-translate-y-0.5"
                >
                  {L("进入术前评估工具", "Open the risk tool")} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/overview"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-[14px] text-muted transition-colors hover:border-brand/40 hover:text-brand"
                >
                  {L("查看成果总览", "Browse the full results")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
