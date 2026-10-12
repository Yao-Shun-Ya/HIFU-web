/**
 * 子宫腺肌病 US-guided HIFU 高消融难度预测模型
 * ---------------------------------------------------------------
 * 参数来源：论文图3「高消融难度预测列线图」的刻度经像素级逆向标定得到，
 * 与列线图的读数完全等价（总分 → 概率的映射亦由图3的 Total Points /
 * Risk of Outcome 双轴反解）。若你拿到论文表5的多因素 Logistic 系数，
 * 直接替换下方 COEFFICIENTS 即可，全站（含诊断工具）会自动同步。
 */

import { bi, type Bi, type Locale } from "./bi";

/** 双语取值 */
const z = (locale: Locale, zh: string, en: string) => (locale === "en" ? en : zh);

export const MODEL_META = {
  name: "AM-HIFU Difficulty Nomogram",
  version: "1.0.0-nomogram",
  source: "列线图刻度逆向标定（reverse-calibrated from Fig.3）",
  cohort: { total: 486, train: 340, valid: 146 },
  auc: { train: 0.903, trainCi: [0.867, 0.939], valid: 0.923, validCi: [0.876, 0.97] },
  dca: { train: [0.05, 0.8], valid: [0.05, 0.75] },
} as const;

/** 列线图几何：Points 轴 0→100 分；Total Points 轴 0→260 分 */
export const GEOMETRY = {
  /** 每 1 总分对应的 logit 增量（由 Total Points 轴与 Risk 轴对齐求得） */
  logitPerPoint: 0.050766,
  /** 概率 = 0.5 时的总分（Risk 轴 0.5 刻度对齐 Total Points 轴） */
  zeroLogitPoints: 178.71,
  /** 列线图 Points 轴满量程 */
  fullScale: 100,
} as const;

/** 各变量的「分值」映射（列线图读数），单位分 */
export const POINTS = {
  ageUnder35: 37.95,
  /** 子宫体积：1000 cm³ → 0 分，0 cm³ → 100 分 */
  volumePerCm3: 0.1,
  volumeReference: 1000,
  /** 腹壁厚度：10 mm → 0 分，55 mm → 81.1 分 */
  wallPerMm: 1.80323,
  wallReference: 10,
  kishi: { I: 0, II: 15.27, III: 4.89, IV: 27.33 } as Record<Kishi, number>,
  t2Hyperintense: 36.04,
  t1Marked: 18.26,
} as const;

/** 等价的多因素 Logistic 系数（对数优势比），由分值 × logit/分 换算 */
export const COEFFICIENTS = {
  intercept: -4.9112,
  ageUnder35: 1.9266,
  /** 每 +100 cm³ */
  volumePer100cm3: -0.50766,
  /** 每 +10 mm */
  wallPer10mm: 0.91544,
  kishiII: 0.7752,
  kishiIII: 0.2483,
  kishiIV: 1.3874,
  t2Hyperintense: 1.8296,
  t1Marked: 0.9269,
} as const;

export type Kishi = "I" | "II" | "III" | "IV";
export type T2Signal = "hypoIso" | "hyper";
export type T1Enhance = "mildMod" | "marked";

export interface PatientInput {
  age: number;
  /** 子宫体积 cm³ */
  volume: number;
  /** 腹壁厚度 mm */
  wall: number;
  kishi: Kishi;
  t2: T2Signal;
  t1: T1Enhance;
}

export const RANGES = {
  age: { min: 20, max: 55, step: 1, def: 36 },
  volume: { min: 40, max: 1000, step: 5, def: 260 },
  wall: { min: 10, max: 55, step: 0.5, def: 24 },
} as const;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(v) ? v : min));

export interface FactorPoints {
  key: string;
  label: string;
  detail: string;
  points: number;
  maxPoints: number;
  modifiable: boolean;
}

/** 逐因子分值（用于贡献分解图与列线图辅助线） */
export function factorPoints(p: PatientInput, locale: Locale = "zh"): FactorPoints[] {
  const agePts = p.age < 35 ? POINTS.ageUnder35 : 0;
  const volPts = clamp((POINTS.volumeReference - p.volume) * POINTS.volumePerCm3, 0, 100);
  const wallPts = (p.wall - POINTS.wallReference) * POINTS.wallPerMm;
  const kishiPts = POINTS.kishi[p.kishi];
  const t2Pts = p.t2 === "hyper" ? POINTS.t2Hyperintense : 0;
  const t1Pts = p.t1 === "marked" ? POINTS.t1Marked : 0;

  return [
    {
      key: "age",
      label: z(locale, "年龄", "Age"),
      detail: p.age < 35 ? z(locale, "< 35 岁", "< 35 y") : z(locale, "≥ 35 岁", "≥ 35 y"),
      points: agePts,
      maxPoints: POINTS.ageUnder35,
      modifiable: false,
    },
    {
      key: "volume",
      label: z(locale, "子宫体积", "Uterine volume"),
      detail: `${Math.round(p.volume)} cm³`,
      points: volPts,
      maxPoints: 100,
      modifiable: false,
    },
    {
      key: "wall",
      label: z(locale, "腹壁厚度", "Wall thickness"),
      detail: `${p.wall.toFixed(1)} mm`,
      points: wallPts,
      maxPoints: 81.1,
      modifiable: true,
    },
    {
      key: "kishi",
      label: z(locale, "Kishi 分型", "Kishi type"),
      detail: `Kishi ${p.kishi}`,
      points: kishiPts,
      maxPoints: POINTS.kishi.IV,
      modifiable: false,
    },
    {
      key: "t2",
      label: z(locale, "T2WI 信号", "T2WI signal"),
      detail: p.t2 === "hyper" ? z(locale, "高信号", "Hyperintense") : z(locale, "低/等信号", "Hypo/isointense"),
      points: t2Pts,
      maxPoints: POINTS.t2Hyperintense,
      modifiable: false,
    },
    {
      key: "t1",
      label: z(locale, "T1WI 增强", "T1WI enhancement"),
      detail: p.t1 === "marked" ? z(locale, "明显强化", "Marked") : z(locale, "轻/中度强化", "Mild/moderate"),
      points: t1Pts,
      maxPoints: POINTS.t1Marked,
      modifiable: false,
    },
  ];
}

export function totalPoints(p: PatientInput): number {
  return factorPoints(p).reduce((s, f) => s + f.points, 0);
}

/** 列线图读数 → 高消融难度概率 */
export function probability(p: PatientInput): number {
  const lp = GEOMETRY.logitPerPoint * (totalPoints(p) - GEOMETRY.zeroLogitPoints);
  return 1 / (1 + Math.exp(-lp));
}

/** 等价 Logistic 线性预测值（便于与论文表5对照） */
export function linearPredictor(p: PatientInput): number {
  let lp = COEFFICIENTS.intercept;
  if (p.age < 35) lp += COEFFICIENTS.ageUnder35;
  lp += (COEFFICIENTS.volumePer100cm3 / 100) * p.volume;
  lp += (COEFFICIENTS.wallPer10mm / 10) * p.wall;
  if (p.kishi === "II") lp += COEFFICIENTS.kishiII;
  if (p.kishi === "III") lp += COEFFICIENTS.kishiIII;
  if (p.kishi === "IV") lp += COEFFICIENTS.kishiIV;
  if (p.t2 === "hyper") lp += COEFFICIENTS.t2Hyperintense;
  if (p.t1 === "marked") lp += COEFFICIENTS.t1Marked;
  return lp;
}

export type Band = "low" | "mid" | "high";

export interface RiskResult {
  points: number;
  prob: number;
  band: Band;
  label: string;
  color: string;
  factors: FactorPoints[];
  lp: number;
}

export function evaluate(p: PatientInput, locale: Locale = "zh"): RiskResult {
  const prob = probability(p);
  const band: Band = prob < 0.1 ? "low" : prob < 0.4 ? "mid" : "high";
  const label =
    band === "low"
      ? z(locale, "低消融难度", "Low difficulty")
      : band === "mid"
        ? z(locale, "中等消融难度", "Intermediate difficulty")
        : z(locale, "高消融难度", "High difficulty");
  const color = band === "low" ? "var(--low)" : band === "mid" ? "var(--mid)" : "var(--high)";
  return { points: totalPoints(p), prob, band, label, color, factors: factorPoints(p, locale), lp: linearPredictor(p) };
}

/** 概率 → 阈值决策（对应 DCA 的 5%–80% 净获益区间） */
export function decisionHint(prob: number, locale: Locale = "zh"): string {
  if (prob < 0.05)
    return z(locale, "低于模型净获益阈值下限（5%）：按常规流程安排治疗即可。", "Below the lower net-benefit threshold (5%): proceed with the routine workflow.");
  if (prob < 0.1)
    return z(locale, "低风险：常规术前计划，标准能量与辐照时间预算。", "Low risk: standard pre-operative planning with routine energy and sonation budgets.");
  if (prob < 0.4)
    return z(locale, "中风险：建议预留额外辐照时间与能量预算，并提前规划声窗。", "Intermediate risk: budget extra sonation time and energy, and prepare the acoustic window in advance.");
  if (prob <= 0.8)
    return z(locale, "高风险：建议强化肠道准备/膀胱充盈、分区分次消融，并充分术前沟通。", "High risk: intensify bowel preparation and bladder filling, plan zone-wise or staged ablation, and counsel thoroughly.");
  return z(locale, "概率超出 DCA 净获益区间上限（80%）：应结合多学科讨论重新评估适应证与替代方案。", "Above the upper net-benefit limit (80%): reconsider indications and alternatives at a multidisciplinary meeting.");
}

/** 主导风险因子 → 针对性建议 */
export function adviceFor(p: PatientInput, locale: Locale = "zh"): { factor: string; advice: string }[] {
  const out: { factor: string; advice: string }[] = [];
  const f = factorPoints(p, locale);
  const by = (k: string) => f.find((x) => x.key === k)!;
  if (by("wall").points > 25)
    out.push({
      factor: z(locale, "腹壁厚度偏大", "Increased abdominal wall thickness"),
      advice: z(locale, "声衰减与去聚焦风险升高：术前禁食、肠道准备、必要时加压腹壁或改变体位，重新测算入射能量。", "Higher beam attenuation and defocusing: fasting and bowel preparation, abdominal compression or repositioning when needed, and re-estimate the incident energy."),
    });
  if (by("volume").points > 60)
    out.push({
      factor: z(locale, "子宫体积偏小", "Small uterine volume"),
      advice: z(locale, "病灶位置深、盆腔声窗受限：优先确认病灶中心至腹壁/骶骨距离，必要时采用改变进针路径或分次治疗。", "Lesions sit deep with a restricted pelvic window: verify the distance from lesion centre to the abdominal wall/sacrum, and consider an alternative beam path or staged treatment."),
    });
  if (p.kishi === "IV")
    out.push({
      factor: z(locale, "Kishi IV 型（弥漫广泛型）", "Kishi type IV (diffuse)"),
      advice: z(locale, "病灶累及范围广、边界不清：建议分区消融策略，术前评估 GnRH 激动剂预处理的可能获益。", "Wide, ill-defined involvement: use a zone-wise ablation strategy and assess the potential benefit of GnRH-agonist pre-treatment."),
    });
  if (p.t2 === "hyper")
    out.push({
      factor: z(locale, "T2WI 高信号", "Hyperintense T2WI"),
      advice: z(locale, "提示腺肌病灶含较多腺体/出血成分，热沉效应与血供影响消融效率：预留更长辐照时间并即时 CEUS 复核。", "Suggests glandular/haemorrhagic components where heat-sink and perfusion reduce efficiency: allow longer sonation and review with immediate CEUS."),
    });
  if (p.t1 === "marked")
    out.push({
      factor: z(locale, "T1WI 明显强化", "Marked T1WI enhancement"),
      advice: z(locale, "血供丰富，热清除效应显著：可考虑分区分次消融、控制单点辐照剂量，术后 24 h 增强 MRI 评估 NPVR。", "Rich vascularisation with strong heat clearance: consider zone-wise or staged ablation with limited per-point dose, and assess NPVR on 24 h contrast MRI."),
    });
  if (p.age < 35)
    out.push({
      factor: z(locale, "年龄 < 35 岁", "Age < 35 years"),
      advice: z(locale, "多有生育力保留需求：在保证消融安全边界的前提下控制能量沉积，术后随访内膜与宫腔形态。", "Fertility preservation is often intended: limit energy deposition while keeping a safe ablation margin, and follow up the endometrium and cavity morphology."),
    });
  if (!out.length)
    out.push({ factor: z(locale, "未见显著高危特征", "No dominant high-risk feature"), advice: z(locale, "各项指标均处于低分值区间，可按标准流程实施与随访。", "All variables fall in low-point ranges; proceed with the standard protocol and follow-up.") });
  return out;
}

export const EXAMPLE_CASES: { name: Bi; note: Bi; input: PatientInput }[] = [
  {
    name: bi("典型病例 A · 32岁 / Kishi IV / 血供丰富", "Case A · 32 y / Kishi IV / hypervascular"),
    note: bi("高难度情景：年轻、小体积、弥漫型、明显强化（概率约 96%）", "High-difficulty scenario: young, small volume, diffuse type, marked enhancement (probability ≈96%)"),
    input: { age: 32, volume: 155, wall: 31, kishi: "IV", t2: "hyper", t1: "marked" },
  },
  {
    name: bi("典型病例 B · 41岁 / Kishi II / 腹壁偏厚", "Case B · 41 y / Kishi II / thick wall"),
    note: bi("临界情景：总分落在中段，概率约 14%，需权衡声窗准备与分次计划", "Borderline scenario: mid-range total points, probability ≈14%; weigh acoustic-window preparation against staged planning"),
    input: { age: 41, volume: 260, wall: 30, kishi: "II", t2: "hypoIso", t1: "marked" },
  },
  {
    name: bi("典型病例 C · 45岁 / Kishi I / 低信号", "Case C · 45 y / Kishi I / low signal"),
    note: bi("低难度情景：纤维化为主、声窗良好（概率 < 1%）", "Low-difficulty scenario: fibrosis-predominant with a good acoustic window (probability <1%)"),
    input: { age: 45, volume: 480, wall: 18, kishi: "I", t2: "hypoIso", t1: "mildMod" },
  },
];

/** 供森林图/参数表使用：OR 及 95%CI（CI 由分值标定不确定度估算，仅示意） */
export const OR_TABLE = [
  { var: bi("年龄 < 35 岁", "Age < 35 y"), beta: COEFFICIENTS.ageUnder35, ci: 0.42, max: POINTS.ageUnder35 },
  { var: bi("子宫体积（每 +100 cm³）", "Uterine volume (per +100 cm³)"), beta: COEFFICIENTS.volumePer100cm3, ci: 0.2, max: 100 },
  { var: bi("腹壁厚度（每 +10 mm）", "Wall thickness (per +10 mm)"), beta: COEFFICIENTS.wallPer10mm, ci: 0.22, max: (RANGES.wall.max - POINTS.wallReference) * POINTS.wallPerMm },
  { var: bi("Kishi II（vs I）", "Kishi II (vs I)"), beta: COEFFICIENTS.kishiII, ci: 0.38, max: POINTS.kishi.II },
  { var: bi("Kishi III（vs I）", "Kishi III (vs I)"), beta: COEFFICIENTS.kishiIII, ci: 0.4, max: POINTS.kishi.III },
  { var: bi("Kishi IV（vs I）", "Kishi IV (vs I)"), beta: COEFFICIENTS.kishiIV, ci: 0.36, max: POINTS.kishi.IV },
  { var: bi("T2WI 高信号", "Hyperintense T2WI"), beta: COEFFICIENTS.t2Hyperintense, ci: 0.4, max: POINTS.t2Hyperintense },
  { var: bi("T1WI 明显强化", "Marked T1WI enhancement"), beta: COEFFICIENTS.t1Marked, ci: 0.3, max: POINTS.t1Marked },
].map((d) => ({
  ...d,
  or: Math.exp(d.beta),
  lo: Math.exp(d.beta - d.ci),
  hi: Math.exp(d.beta + d.ci),
}));
