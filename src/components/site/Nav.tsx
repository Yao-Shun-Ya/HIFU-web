"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Stethoscope, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";
import { ScrollProgress, useScrolled } from "./motion";

export function Nav() {
  const pathname = usePathname();
  const { L, T } = useLocale();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const scrolled = useScrolled(12);
  const isActive = (href: Route) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 路由变化（含浏览器前进/后退）时收起移动端菜单：渲染期同步，避免多余的一次渲染
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="no-print sticky top-0 z-50">
      <div
        aria-hidden="true"
        className={cn(
          "glass absolute inset-0 border-b transition-[border-color,box-shadow,backdrop-filter] duration-500",
          scrolled
            ? "border-line shadow-[0_18px_44px_-34px_rgba(0,0,0,0.65)]"
            : "border-transparent",
        )}
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
        <ScrollProgress className="w-full" />
      </div>

      <div
        className={cn(
          "relative mx-auto flex max-w-6xl items-center gap-4 px-5 transition-[height] duration-500 ease-out",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand2 text-white shadow-lg transition-transform duration-500 group-hover:scale-105 group-active:scale-95">
            <Stethoscope className="h-4.5 w-4.5" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-white/25" />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold tracking-tight">
              {L(SITE.shortTitle, SITE.shortTitleEn)}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              nomogram · v1.0
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {SITE.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={cn(
                "group relative rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-300",
                isActive(n.href) ? "text-brand" : "text-muted hover:text-fg",
              )}
            >
              {isActive(n.href) ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-brand-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : (
                <span className="absolute inset-x-3.5 bottom-1 h-px scale-x-0 bg-line-strong transition-transform duration-300 ease-out group-hover:scale-x-100" />
              )}
              <span className="relative">{T(n.label)}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <LangToggle />
          <ThemeToggle />
          <Link
            href="/assessment"
            className="sheen group hidden rounded-full bg-fg px-4 py-2 text-[13px] font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-14px_color-mix(in_oklab,var(--fg)_60%,transparent)] active:translate-y-0 sm:block"
          >
            <span className="inline-flex items-center gap-1.5">
              {L("术前风险评估", "Pre-op risk assessment")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-line-strong hover:text-fg md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={L("菜单", "Menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {SITE.nav.map((n, i) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={cn(
                    "rise border-b border-line/60 py-3 text-sm last:border-0",
                    isActive(n.href) ? "text-brand" : "text-muted",
                  )}
                >
                  {T(n.label)}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
