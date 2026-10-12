"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export function ThemeToggle() {
  const { L } = useLocale();
  // null：主题仍由内联脚本 / CSS 决定，此时用 CSS 变体决定图标，禁用 JS 也正确
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // 首屏主题由 layout 内联脚本决定；此处只把状态同步进 React，用于 aria 文案
    const stored = localStorage.getItem("theme");
    const isDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const label =
    dark === null
      ? L("切换主题", "Toggle theme")
      : dark
        ? L("切换到浅色主题", "Switch to light theme")
        : L("切换到深色主题", "Switch to dark theme");

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={dark === null ? undefined : dark}
      title={dark ? "light / 浅色" : "dark / 深色"}
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark");
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
      }}
      className="group grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/60 text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:text-brand active:translate-y-0"
    >
      <Sun className="hidden h-4 w-4 rotate-0 transition-all duration-500 group-hover:rotate-45 dark:block" />
      <Moon className="h-4 w-4 rotate-0 transition-all duration-500 group-hover:-rotate-12 dark:hidden" />
    </button>
  );
}
