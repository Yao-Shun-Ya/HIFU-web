"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type HoverPos = { x: number; y: number } | null;

/** 把指针位置换算为 SVG viewBox 坐标（rAF 节流，避免每帧重渲染整张图） */
export function useChartHover(W: number, H: number) {
  const [pos, setPos] = useState<HoverPos>(null);
  const frame = useRef(0);

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const { clientX, clientY } = e;
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        setPos({
          x: ((clientX - rect.left) / rect.width) * W,
          y: ((clientY - rect.top) / rect.height) * H,
        });
      });
    },
    [W, H],
  );

  const onPointerLeave = useCallback(() => setPos(null), []);

  return { pos, handlers: { onPointerMove, onPointerLeave } };
}

/** 按 x 找最近的数据点 */
export function nearestByX<T extends { x: number }>(pts: T[], x: number): T {
  let best = pts[0];
  let bd = Number.POSITIVE_INFINITY;
  for (const p of pts) {
    const d = Math.abs(p.x - x);
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best;
}

/** 图内读数框：跟随指针，自动避开边界 */
/** 读数框宽度估算：CJK 与全角标点按双宽计 */
const glyph = (s: string) =>
  [...s].reduce((a, ch) => a + (ch.charCodeAt(0) > 0x2e7f ? 9.6 : 5.6), 0);

export function Readout({
  x,
  y,
  W,
  lines,
  accent = "var(--brand)",
}: {
  x: number;
  y: number;
  W: number;
  lines: { k: string; v: string }[];
  accent?: string;
}) {
  const w =
    Math.max(94, ...lines.map((l) => glyph(l.k) + glyph(l.v) + 18)) + 22;
  const h = lines.length * 13 + 12;
  const bx = x > W / 2 ? Math.max(6, x - w - 14) : Math.min(W - w - 6, x + 14);
  const by = Math.max(6, Math.min(y - h / 2, 340 - h - 6));
  return (
    <g
      pointerEvents="none"
      style={{ filter: "drop-shadow(0 5px 14px rgb(0 0 0 / 0.16))" }}
    >
      <rect
        x={bx}
        y={by}
        width={w}
        height={h}
        rx="7"
        fill="var(--surface)"
        stroke="var(--line-strong)"
        opacity="0.97"
      />
      <rect x={bx} y={by} width="2.5" height={h} rx="1.5" fill={accent} />
      {lines.map((l, i) => (
        <g key={l.k}>
          <text
            x={bx + 10}
            y={by + 17 + i * 13}
            className="fill-[var(--muted)] font-mono text-[9px]"
          >
            {l.k}
          </text>
          <text
            x={bx + w - 10}
            y={by + 17 + i * 13}
            textAnchor="end"
            className="fill-[var(--fg)] font-mono text-[9.5px] font-semibold"
          >
            {l.v}
          </text>
        </g>
      ))}
    </g>
  );
}
