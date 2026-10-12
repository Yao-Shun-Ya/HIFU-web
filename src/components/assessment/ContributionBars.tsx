"use client";

import type { FactorPoints } from "@/lib/model";
import { useLocale } from "@/lib/i18n";

export function ContributionBars({ factors }: { factors: FactorPoints[] }) {
  const { L } = useLocale();
  const sorted = [...factors].sort((a, b) => b.points - a.points);
  const max = Math.max(...factors.map((f) => f.maxPoints));
  return (
    <div className="space-y-3">
      {sorted.map((f, i) => (
        <div key={f.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-[12.5px]">
              {f.label}
              <span className="ml-2 text-[11.5px] text-muted">{f.detail}</span>
            </span>
            <span className="font-mono text-[11.5px] text-muted">
              {f.points.toFixed(1)} / {f.maxPoints.toFixed(0)} {L("分", "pts")}
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="grow absolute inset-y-0 left-0 rounded-full transition-[width] duration-300"
              style={{
                ["--d" as string]: `${i * 0.06}s`,
                width: `${(f.points / max) * 100}%`,
                background:
                  f.points / f.maxPoints > 0.6
                    ? "var(--high)"
                    : f.points / f.maxPoints > 0.3
                      ? "var(--mid)"
                      : "var(--brand)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
