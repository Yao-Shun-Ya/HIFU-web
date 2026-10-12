"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, type RevealVariant } from "./Reveal";
import { CountUp, useSpotlight } from "./motion";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-6xl px-5 py-16 sm:py-20", className)}>
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  index = 0,
  variant = "left",
}: {
  children: ReactNode;
  index?: number;
  variant?: RevealVariant;
}) {
  return (
    <Reveal index={index} variant={variant}>
      <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
        <span className="h-px w-6 origin-left scale-x-0 bg-brand transition-transform duration-700 delay-200 [.reveal-in_&]:scale-x-100" />
        {children}
      </p>
    </Reveal>
  );
}

export function Heading({
  title,
  desc,
  index = 0,
  className,
  variant = "up",
}: {
  title: ReactNode;
  desc?: ReactNode;
  index?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  return (
    <Reveal index={index} variant={variant}>
      <h2 className={cn("max-w-3xl text-balance text-2xl font-semibold tracking-tight sm:text-[32px]", className)}>
        {title}
      </h2>
      {desc && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{desc}</p>}
    </Reveal>
  );
}

/** 卡片：悬停抬升 + 跟随指针的光斑与描边辉光（仅指针设备） */
export function Card({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const { onPointerMove } = useSpotlight<HTMLDivElement>();
  return (
    <div
      onPointerMove={hover ? onPointerMove : undefined}
      className={cn("min-w-0 surface rounded-2xl p-5", hover && "card-hover spot", className)}
    >
      {children}
    </div>
  );
}

/** 关键数字：进入视口时滚动到位（非纯数字则原样显示） */
export function Stat({ v, k, sub }: { v: string; k: string; sub?: string }) {
  const numeric = /^\d[\d,]*(\.\d+)?$/.test(v);
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{k}</p>
      <p className="mt-1 bg-gradient-to-br from-fg to-muted bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
        {numeric ? <CountUp value={v} /> : v}
      </p>
      {sub && <p className="mt-1 font-mono text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "neutral" | "warn";
}) {
  const tones = {
    brand: "border-brand/30 bg-brand-soft text-brand",
    neutral: "border-line bg-surface-2 text-muted",
    warn: "border-mid/30 bg-mid/10 text-mid",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Formula({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="surface rounded-xl px-4 py-3.5">
      <code className="block font-mono text-[13px] leading-relaxed text-fg">{children}</code>
      {note && <p className="mt-2 text-[12px] leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

export function DataTable({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: (string | number | ReactNode)[][];
  caption?: string;
}) {
  return (
    <div className="surface overflow-x-auto rounded-2xl">
      <table className="w-full border-collapse text-left text-[13px]">
        {caption && (
          <caption className="border-b border-line px-4 py-3 text-left text-[12px] text-muted">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-line bg-surface-2/70">
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="group/row border-b border-line/70 transition-colors last:border-0 hover:bg-brand-soft/40"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-4 py-3 align-top transition-colors group-hover/row:text-fg",
                    j === 0 ? "font-medium" : "text-muted",
                  )}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
