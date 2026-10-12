"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "./motion";

export type RevealVariant = "up" | "left" | "right" | "scale" | "blur" | "mask";

/**
 * 纯 CSS 过渡 + IntersectionObserver 的揭示动画。
 * 不依赖 JS 动画帧：无脚本 / 禁用动画 / 截图环境下内容始终可见。
 * variant 决定入场方向与质感，index 负责同屏内的错峰。
 */
export function Reveal({
  children,
  index = 0,
  className,
  variant = "up",
  step = 70,
  style,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  variant?: RevealVariant;
  /** 相邻 index 之间的间隔（ms） */
  step?: number;
  style?: CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  // 外层负责观测与布局（自身永不被裁剪），内层承载过渡。
  // IntersectionObserver 会把元素自身的 clip-path 计入可见区域：mask 变体
  // 初始态被裁剪为 0 面积，若在同一元素上观测则永远不会触发 reveal-in。
  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <div
        data-v={variant}
        className={cn("reveal h-full", inView && "reveal-in")}
        style={{ ...style, transitionDelay: `${Math.min(index, 10) * step}ms` }}
      >
        {children}
      </div>
    </div>
  );
}
