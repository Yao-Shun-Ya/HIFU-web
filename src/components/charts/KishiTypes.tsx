"use client";

import { bi, type Bi } from "@/lib/bi";
import { useLocale } from "@/lib/i18n";

const TYPES: { k: string; name: Bi; desc: Bi; pts: number; lesions: number[][] }[] = [
  { k: "I", name: bi("基底结合带型","Junctional-zone type"), desc: bi("结合带内点状高信号（≤5 mm），病灶局限于基底结合带。","Punctate high signal (≤5 mm) within the junctional zone; disease confined to the basal junctional zone."), pts: 0, lesions: [[38, 30], [46, 24], [54, 26], [60, 34]] },
  { k: "II", name: bi("前壁型","Anterior-wall type"), desc: bi("前壁肌层受累，常伴前壁局限性腺肌瘤样改变。","Anterior myometrial involvement, often with focal adenomyomatous change in the anterior wall."), pts: 15.27, lesions: [[46, 20]] },
  { k: "III", name: bi("后壁型","Posterior-wall type"), desc: bi("后壁肌层受累，可伴后部腺肌囊肿，声窗常受限。","Posterior myometrial involvement, sometimes with posterior adenomyotic cysts; the acoustic window is often restricted."), pts: 4.89, lesions: [[52, 62]] },
  { k: "IV", name: bi("弥漫广泛型","Diffuse extensive type"), desc: bi("广泛累及全层肌层与宫腔，常伴大囊腔，计划最复杂。","Widespread involvement of the full myometrial thickness and uterine cavity, often with large cysts; the most complex plan."), pts: 27.33, lesions: [[36, 30], [56, 34], [46, 56], [60, 52]] },
];

function Uterus({ lesions, active }: { lesions: number[][]; active: boolean }) {
  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24">
      <defs>
        <radialGradient id={`ug-${lesions.length}-${lesions[0]?.[0]}`}>
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.15" />
        </radialGradient>
      </defs>
      <path
        d="M20 40 C20 20 34 12 48 12 C62 12 76 20 76 40 C76 60 66 74 48 82 C30 74 20 60 20 40 Z"
        fill="var(--surface-2)"
        stroke="var(--line-strong)"
        strokeWidth="1.4"
      />
      <path d="M40 44 L48 30 L56 44 L48 58 Z" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.1" />
      <path d="M48 82 L48 92" stroke="var(--line-strong)" strokeWidth="2" />
      {lesions.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i === 0 && lesions.length === 1 ? 12 : 7} fill={`url(#ug-${lesions.length}-${lesions[0]?.[0]})`} opacity={active ? 1 : 0.55} />
      ))}
    </svg>
  );
}

export function KishiTypes({ active }: { active?: string }) {
  const { L, T } = useLocale();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TYPES.map((t) => (
        <div
          key={t.k}
          className={`surface rounded-2xl p-4 transition-all ${active === t.k ? "ring-2 ring-brand" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">Kishi {t.k}</span>
            <span className="font-mono text-[11px] text-muted">{L(`${t.pts} 分`, `${t.pts} pts`)}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <Uterus lesions={t.lesions} active={active === t.k} />
            <div>
              <p className="text-[13px] font-semibold">{T(t.name)}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{T(t.desc)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
