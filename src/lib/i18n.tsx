"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { pick, type Bi, type Locale } from "./bi";

export type { Bi, Locale };
export { bi } from "./bi";

const STORE_KEY = "khy-locale";
const listeners = new Set<() => void>();

function currentLocale(): Locale {
  if (typeof document === "undefined") return "zh";
  return document.documentElement.dataset.locale === "en" ? "en" : "zh";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * 语言状态存放在 <html data-locale>（由 layout 的内联脚本在首屏前写入），
 * 因此服务端渲染与客户端水合不会失配，切换时全站即时重渲染。
 */
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, currentLocale, () => "zh" as Locale);

  const setLocale = useCallback((next: Locale) => {
    const root = document.documentElement;
    root.dataset.locale = next;
    root.lang = next === "en" ? "en" : "zh-CN";
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      /* 隐私模式下忽略 */
    }
    listeners.forEach((l) => l());
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(currentLocale() === "en" ? "zh" : "en");
  }, [setLocale]);

  /** 行内二元组：L("中文", "English") */
  const L = useCallback((zh: string, en: string) => (locale === "en" ? en : zh), [locale]);
  /** 取双语对象 */
  const T = useCallback((v: Bi | string) => pick(v, locale), [locale]);

  return { locale, setLocale, toggleLocale, L, T };
}

/**
 * meta description 跟随语言：路由标题采用「中文 · English」并列写法，
 * 因此无需在客户端覆盖 document.title；描述则在水合后（以及每次切换后）同步一次。
 */
const META: Record<Locale, { desc: string }> = {
  zh: {
    desc: "基于 MRI 与临床特征的子宫腺肌病 US-guided HIFU 高消融难度列线图模型：486 例单中心队列，训练集 AUC 0.903、内部验证 AUC 0.923，含可交互术前风险评估工具。",
  },
  en: {
    desc: "A nomogram predicting high-difficulty US-guided HIFU ablation of adenomyosis from MRI and clinical features: a 486-patient single-centre cohort, training AUC 0.903 and internal-validation AUC 0.923, with an interactive pre-treatment risk tool.",
  },
};

export function useMetaSync() {
  const locale = useSyncExternalStore(subscribe, currentLocale, () => "zh" as Locale);
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute("content", META[locale].desc);
  }, [locale]);
}
