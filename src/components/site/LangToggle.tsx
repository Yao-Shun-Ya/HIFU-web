"use client";

import { Languages } from "lucide-react";
import { useLocale, useMetaSync } from "@/lib/i18n";

export function LangToggle() {
  useMetaSync();
  const { locale, toggleLocale } = useLocale();
  const next = locale === "en" ? "zh" : "en";
  return (
    <button
      onClick={toggleLocale}
      aria-label={locale === "en" ? "切换到中文" : "Switch to English"}
      title={locale === "en" ? "切换到中文" : "Switch to English"}
      className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-2.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/50 hover:text-brand active:translate-y-0"
    >
      <Languages className="h-3.5 w-3.5" />
      <span className={locale === "zh" ? "text-brand" : ""}>中</span>
      <span className="text-line-strong transition-transform duration-300 group-hover:translate-x-0.5">/</span>
      <span className={locale === "en" ? "text-brand" : ""}>EN</span>
      <span className="sr-only">{next}</span>
    </button>
  );
}
