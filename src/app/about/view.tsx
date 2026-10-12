"use client";

import { Card, DataTable, Eyebrow, Heading, Section, Stat } from "@/components/site/ui";
import { Reveal } from "@/components/site/Reveal";
import { useLocale } from "@/lib/i18n";
import { REFS, SITE } from "@/lib/data";
import { COEFFICIENTS, GEOMETRY, MODEL_META, OR_TABLE } from "@/lib/model";

export function AboutView() {
  const { L, T } = useLocale();

  const stats = [
    { v: "1", k: L("单一模型定义", "One model definition"), sub: L("lib/model.ts 唯一来源", "single source in lib/model.ts") },
    { v: "6", k: L("术前输入因子", "pre-treatment inputs"), sub: L("与图3 逐项对应", "matches Figure 3 item by item") },
    { v: "0.0508", k: L("每分 logit 变化", "logit change per point"), sub: L("由 Risk 轴反推", "reverse-derived from the Risk axis") },
    { v: "178.7", k: L("logit = 0 对应总分", "total points at logit = 0"), sub: L("概率 50% 处", "the 50% probability point") },
  ];

  return (
    <Section className="pt-10">
      <Eyebrow>{L("About · 关于与声明", "About and disclosures")}</Eyebrow>
      <Heading
        title={L("这个网站把一篇论文变成可用工具", "This site turns one paper into a working tool")}
        desc={L("本站不是论文的截图集合，而是把列线图重写为可计算、可分享、可审计的网页实现：所有输入输出都由同一份模型定义驱动。", "Rather than a gallery of paper screenshots, the nomogram is rewritten as a computable, shareable and auditable web implementation: every input and output is driven by one shared model definition.")}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal variant="scale" key={s.k} index={i}>
            <Card className="h-full">
              <Stat v={s.v} k={s.k} sub={s.sub} />
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("模型参数（由图3 列线图刻度逆向标定）", "Model parameters (reverse-calibrated from Figure 3)")}</p>
            <DataTable
              head={[L("因子", "Factor"), L("最大分值", "Max points"), L("OR（换算）", "OR (derived)")]}
              rows={OR_TABLE.map((d) => [
                T(d.var),
                d.max.toFixed(1),
                `${d.or.toFixed(2)} (${d.lo.toFixed(2)}–${d.hi.toFixed(2)})`,
              ])}
              caption={L("分值取自列线图刻度；OR = exp(分值 × 0.050766)。", "Points read from the nomogram scale; OR = exp(points × 0.050766).")}
            />
            <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11.5px] text-muted">
              <div className="rounded-lg border border-line bg-surface-2/60 px-3 py-2">
                logitPerPoint = {GEOMETRY.logitPerPoint}
              </div>
              <div className="rounded-lg border border-line bg-surface-2/60 px-3 py-2">
                zeroLogitPoints = {GEOMETRY.zeroLogitPoints}
              </div>
            </div>
          </Card>
        </Reveal>

        <Reveal variant="left" index={1}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("等价的 Logistic 形式", "Equivalent logistic form")}</p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-surface-2/60 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-muted">
{`logit(${L("高难度", "high difficulty")}) = ${COEFFICIENTS.intercept}
  ${COEFFICIENTS.ageUnder35 >= 0 ? "+" : ""}${COEFFICIENTS.ageUnder35} · 1(${L("年龄<35", "age <35")})
  ${COEFFICIENTS.volumePer100cm3} · (${L("体积", "volume")}/100 cm³)
  +${COEFFICIENTS.wallPer10mm} · (${L("腹壁厚度", "wall")}−10)/10 mm
  +${COEFFICIENTS.kishiII} · 1(Kishi II)
  +${COEFFICIENTS.kishiIII} · 1(Kishi III)
  +${COEFFICIENTS.kishiIV} · 1(Kishi IV)
  +${COEFFICIENTS.t2Hyperintense} · 1(${L("T2WI 高信号", "T2WI hyperintense")})
  +${COEFFICIENTS.t1Marked} · 1(${L("T1WI 明显强化", "T1WI marked enhancement")})`}
            </pre>
            <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
              {L(`该式与列线图读数完全等价：总分 S 与 logit 的关系为 logit = ${GEOMETRY.logitPerPoint} × (S − ${GEOMETRY.zeroLogitPoints})。若日后获得论文完整回归系数表，只需替换本文件中的系数，全站图表与工具自动同步。`, `This form is exactly equivalent to reading the nomogram: logit = ${GEOMETRY.logitPerPoint} × (S − ${GEOMETRY.zeroLogitPoints}). If the paper’s full coefficient table becomes available, replacing the coefficients in this one file updates every chart and the tool automatically.`)}
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("使用边界与免责声明", "Scope and disclaimer")}</p>
            <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <li>{L("本工具输出的是 ", "The output is a ")}<strong className="text-fg">{L("技术难度风险分层", "technical-difficulty risk stratification")}</strong>{L("，不是疗效预测，也不预测并发症发生率。", ", not a prediction of therapeutic outcome or complication rate.")}</li>
              <li>{L("模型来自单中心回顾性队列，仅完成内部验证（随机 7:3），", "The model comes from a single-centre retrospective cohort with internal validation only (random 7:3); ")}<strong className="text-fg">{L("尚缺乏外部与前瞻性验证", "external and prospective validation is still lacking")}</strong>{L("。", ".")}</li>
              <li>{L("概率超出列线图 Risk 轴（约 0.1–0.9）时属于外推，应结合总分与临床判断，不宜直接引用具体数值。", "Probabilities beyond the nomogram’s Risk axis (about 0.1–0.9) are extrapolations: interpret them together with the total score and clinical judgement rather than quoting the number.")}</li>
              <li>{L("本站不收集、不上传任何输入数据：全部计算在浏览器本地完成，分享链接仅包含输入参数。", "No input data is collected or uploaded: all computation happens locally in the browser, and a share link contains only the input parameters.")}</li>
              <li>{L("任何治疗决策须由具备 HIFU 资质的临床团队结合完整临床资料作出。", "Any treatment decision must be made by a qualified HIFU clinical team using the complete clinical picture.")}</li>
            </ul>
          </Card>
        </Reveal>
        <Reveal variant="right" index={1}>
          <Card hover={false} className="h-full">
            <p className="mb-3 text-[13px] font-semibold">{L("技术实现（前沿 Web 栈）", "Implementation (modern web stack)")}</p>
            <ul className="space-y-2.5 text-[12.5px] leading-relaxed text-muted">
              <li><strong className="text-fg">Next.js 16 App Router + React 19 + TypeScript</strong>{L(" 严格模式", " strict mode")}{L("：全站类型化路由，模型与 UI 分离。", ": typed routing site-wide, with the model separated from the UI.")}</li>
              <li><strong className="text-fg">Tailwind CSS v4</strong>{L("：以 CSS 自定义属性定义设计令牌，浅色/深色主题零闪烁切换。", ": design tokens as custom properties, with zero-flicker light/dark switching.")}</li>
              <li><strong className="text-fg">{L("纯 CSS 揭示与绘制动画", "Pure CSS reveal and drawing animations")}</strong>{L("（IntersectionObserver + transition / stroke-dashoffset），尊重 ", "(IntersectionObserver + transition / stroke-dashoffset), honouring ")}<code>prefers-reduced-motion</code>{L("，无脚本时内容仍完整可读；Motion（Framer Motion v12）仅用于导航指示条与移动端菜单。", "; content stays readable without scripts. Motion (Framer Motion v12) is used only for the nav indicator and the mobile sheet.")}</li>
              <li><strong className="text-fg">{L("纯 SVG 自绘统计图表", "Hand-drawn SVG statistical charts")}</strong>{L("：无图表库依赖，列线图、ROC、校准、DCA、森林图均可审计与打印。", ": no chart library; the nomogram, ROC, calibration, DCA and forest plots are auditable and printable.")}</li>
              <li><strong className="text-fg">{L("中英双语 · 客户端切换", "Bilingual · client-side locale")}</strong>{L("：文案集中在数据层与 ", ": copy lives in the data layer and ")}<code>L()</code>{L("，语言偏好存于本地，切换不重新加载页面。", ", the preference is stored locally, and switching never reloads the page.")}</li>
              <li><strong className="text-fg">{L("URL 状态同步", "URL state sync")}</strong>{L("：评估结果可直接分享，刷新与打印保持一致。", ": results are shareable links that stay consistent on reload and print.")}</li>
            </ul>
            <p className="mt-3 font-mono text-[11px] text-muted">
              {L(SITE.org, SITE.orgEn)} · {SITE.period} · {L("模型版本", "model")} {MODEL_META.version}
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="mt-10">
        <Eyebrow index={2}>{L("参考文献", "References")}</Eyebrow>
        <Reveal>
          <ol className="mt-6 space-y-2.5">
            {REFS.map((r, i) => (
              <li key={r} className="flex gap-3 text-[12.5px] leading-relaxed text-muted">
                <span className="font-mono text-[11px] text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
