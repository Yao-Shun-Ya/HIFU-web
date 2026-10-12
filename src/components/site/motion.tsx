"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** 元素首次进入视口后返回 true（揭示、数字滚动、图表描线共用） */
export function useInView<T extends HTMLElement>(rootMargin = "-60px 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // 不支持 IntersectionObserver 的浏览器：直接显示内容，不做动画
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 兜底分支，仅执行一次
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** 用户是否要求减少动效：JS 侧动画一律遵循它 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** 页面是否已向下滚动（导航栏收缩用） */
export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    const first = requestAnimationFrame(read);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(first);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return scrolled;
}

/** 数字滚动：SSR 输出终值，进入视口后从 0 缓动上去 */
export function CountUp({
  value,
  className,
  duration = 1150,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>("-40px 0px");
  const reduced = useReducedMotion();
  const target = Number(value.replace(/[^\d.]/g, ""));
  const decimals = (value.split(".")[1] ?? "").replace(/[^\d]/g, "").length;
  const [n, setN] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!inView || reduced || !Number.isFinite(target)) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, target, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {n === null ? value : n.toFixed(decimals)}
    </span>
  );
}

/** 卡片跟随指针的光斑：只写 CSS 变量，不触发 re-render */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const raf = useRef(0);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<T>) => {
    const el = e.currentTarget;
    if (raf.current) return;
    const { clientX, clientY } = e;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  }, []);

  return { ref, onPointerMove };
}

/** 指针视差：把指针位置写进目标元素的 --rx/--ry/--tx/--ty（配合 .tilt） */
export function usePointerParallax(
  target: RefObject<HTMLElement | null>,
  { deg = 4, shift = 12 }: { deg?: number; shift?: number } = {},
) {
  const reduced = useReducedMotion();
  const raf = useRef(0);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const el = target.current;
      if (!el || reduced) return;
      const host = e.currentTarget.getBoundingClientRect();
      if (host.width < 1 || host.height < 1) return;
      const nx = ((e.clientX - host.left) / host.width) * 2 - 1;
      const ny = ((e.clientY - host.top) / host.height) * 2 - 1;
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        el.style.setProperty("--ry", `${(nx * deg).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-ny * deg).toFixed(2)}deg`);
        el.style.setProperty("--tx", `${(nx * shift).toFixed(1)}px`);
        el.style.setProperty("--ty", `${(ny * shift).toFixed(1)}px`);
      });
    },
    [target, deg, shift, reduced],
  );

  const onPointerLeave = useCallback(() => {
    const el = target.current;
    if (!el) return;
    for (const p of ["--rx", "--ry", "--tx", "--ty"]) el.style.removeProperty(p);
  }, [target]);

  return { onPointerMove, onPointerLeave };
}

/** 页顶滚动进度条 */
export function ScrollProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 && doc.scrollTop > 8 ? Math.min(1, doc.scrollTop / max) : 0;
      el.style.setProperty("--sp", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "scroll-bar no-print h-[2px] bg-gradient-to-r from-brand via-brand2 to-accent",
        className,
      )}
    />
  );
}

/** 路由切换时的整页入场（key 变化即重放入场动画） */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-in">
      {children}
    </div>
  );
}

/** 数值缓动：输入变化时把数字平滑过渡到新值（仪表、总分共用） */
export function useEased(value: number, duration = 750) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    const a = from.current;
    const b = value;
    if (a === b) return;
    if (reduced) {
      from.current = b;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 减弱动效时直接落到终值
      setOut(b);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - (1 - p) ** 3;
      setOut(a + (b - a) * e);
      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        from.current = b;
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      from.current = b;
    };
  }, [value, duration, reduced]);

  return out;
}
