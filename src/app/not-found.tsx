import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export const metadata = {
  title: "未找到页面 · Not found",
  description: "The page you requested does not exist in this project.",
};

export default function NotFound() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-28 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="drift-a absolute left-1/2 top-10 h-[360px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--brand-soft),transparent)] blur-3xl" />
      </div>

      <p className="rise font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
        404 · route not found
      </p>
      <p className="rise mt-6 font-mono text-[64px] font-semibold leading-none text-fg sm:text-[92px]" style={{ ["--d" as string]: "80ms" }}>
        404
      </p>

      <h1 className="mt-4 text-[22px] font-semibold text-balance sm:text-[26px]">
        <span className="only-zh">这条路径不在列线图里</span>
        <span className="only-en">This route is off the nomogram</span>
      </h1>

      <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
        <span className="only-zh">
          页面可能已改名或尚未部署。可以从下面任一处继续：模型概览、验证证据、交互式术前评估。
        </span>
        <span className="only-en">
          The page may have been renamed or not deployed yet. Continue from the overview, the
          validation evidence, or the interactive pre-treatment assessment.
        </span>
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="sheen group inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-[13px] font-semibold text-on-brand transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-16px_color-mix(in_oklab,var(--brand)_70%,transparent)] active:translate-y-0"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="only-zh">回到首页</span>
          <span className="only-en">Back to home</span>
        </Link>
        <Link
          href="/assessment"
          className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] text-muted transition-colors duration-300 hover:border-brand hover:text-brand"
        >
          <Compass className="h-4 w-4" />
          <span className="only-zh">直接开始术前评估</span>
          <span className="only-en">Open the assessment</span>
        </Link>
      </div>
    </section>
  );
}
