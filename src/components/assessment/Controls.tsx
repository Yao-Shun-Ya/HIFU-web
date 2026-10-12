"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { RANGES, type Kishi, type PatientInput, type T1Enhance, type T2Signal } from "@/lib/model";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { v: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const uid = useId();
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.v)}
            className={cn(
              "relative rounded-lg border px-3 py-2 text-[12.5px] transition-colors duration-300 active:scale-[0.97]",
              active
                ? "border-transparent font-semibold text-brand"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-pill-${uid}`}
                className="absolute inset-0 rounded-lg border border-brand bg-brand-soft"
                transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.7 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string;
  hint?: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line py-4 last:border-0">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold">{label}</p>
          {hint && <p className="mt-0.5 text-[11.5px] text-muted">{hint}</p>}
        </div>
        {value && <span className="whitespace-nowrap font-mono text-[13px] text-brand">{value}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      style={{ ["--pct" as string]: `${pct}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

export function Controls({
  value,
  onChange,
}: {
  value: PatientInput;
  onChange: (v: PatientInput) => void;
}) {
  const { L } = useLocale();
  const set = <K extends keyof PatientInput>(k: K, v: PatientInput[K]) => onChange({ ...value, [k]: v });

  return (
    <div>
      <Field label={L("年龄", "Age")} hint={L("列线图按 <35 岁 / ≥35 岁 二分", "The nomogram dichotomises age at <35 / ≥35 y")} value={`${value.age} ${L("岁", "y")}`}>
        <Slider
          value={value.age}
          min={RANGES.age.min}
          max={RANGES.age.max}
          step={RANGES.age.step}
          onChange={(v) => set("age", v)}
        />
        <div className="mt-1 flex justify-between font-mono text-[10.5px] text-muted">
          <span>{RANGES.age.min}</span>
          <span className="text-brand">{L("分界 35 岁", "cut-off 35 y")}</span>
          <span>{RANGES.age.max}</span>
        </div>
      </Field>

      <Field label={L("子宫体积", "Uterine volume")} hint={L("MRI 三维径线：V = π/6 × D1 × D2 × D3", "MRI three diameters: V = π/6 × D1 × D2 × D3")} value={`${value.volume} cm³`}>
        <Slider
          value={value.volume}
          min={RANGES.volume.min}
          max={RANGES.volume.max}
          step={RANGES.volume.step}
          onChange={(v) => set("volume", v)}
        />
        <div className="mt-1 flex justify-between font-mono text-[10.5px] text-muted">
          <span>{RANGES.volume.min}</span>
          <span>{L("列线图轴 0 – 1000 cm³", "Nomogram axis 0 – 1000 cm³")}</span>
          <span>{RANGES.volume.max}</span>
        </div>
      </Field>

      <Field label={L("腹壁厚度", "Abdominal wall thickness")} hint={L("影响声衰减与去聚焦，是可干预的术前准备靶点", "Affects acoustic attenuation and defocusing — an interventional target of pre-op preparation")} value={`${value.wall.toFixed(1)} mm`}>
        <Slider
          value={value.wall}
          min={RANGES.wall.min}
          max={RANGES.wall.max}
          step={RANGES.wall.step}
          onChange={(v) => set("wall", v)}
        />
        <div className="mt-1 flex justify-between font-mono text-[10.5px] text-muted">
          <span>{RANGES.wall.min}</span>
          <span>{L("列线图轴 10 – 55 mm", "Nomogram axis 10 – 55 mm")}</span>
          <span>{RANGES.wall.max}</span>
        </div>
      </Field>

      <Field label={L("Kishi 分型", "Kishi type")} hint={L("基于盆腔 MRI 的四型分类（Kishi 2012）", "Four-type pelvic-MRI classification (Kishi 2012)")}>
        <Segmented<Kishi>
          value={value.kishi}
          onChange={(v) => set("kishi", v)}
          options={[
            { v: "I", label: "I " + L("基底结合带", "basal junctional zone") },
            { v: "II", label: "II " + L("前壁", "anterior wall") },
            { v: "III", label: "III " + L("后壁", "posterior wall") },
            { v: "IV", label: "IV " + L("弥漫广泛", "diffuse extensive") },
          ]}
        />
      </Field>

      <Field label={L("T2WI 病灶信号强度", "T2WI lesion signal")}>
        <Segmented<T2Signal>
          value={value.t2}
          onChange={(v) => set("t2", v)}
          options={[
            { v: "hypoIso", label: L("低 / 等信号", "hypo- / iso-intense") },
            { v: "hyper", label: L("高信号", "hyperintense") },
          ]}
        />
      </Field>

      <Field label={L("T1WI 增强程度", "T1WI enhancement")} hint={L("反映病灶血供，明显强化为独立预测因子", "Reflects lesion vascularity; marked enhancement is an independent predictor")}>
        <Segmented<T1Enhance>
          value={value.t1}
          onChange={(v) => set("t1", v)}
          options={[
            { v: "mildMod", label: L("轻 / 中度强化", "mild / moderate") },
            { v: "marked", label: L("明显强化", "marked") },
          ]}
        />
      </Field>
    </div>
  );
}
