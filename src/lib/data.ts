import { bi, type Bi } from "./bi";

export const SITE = {
  title: "AM-HIFU 术前消融难度预测模型",
  titleEn: "Predicting US-guided HIFU Ablation Difficulty for Adenomyosis",
  shortTitle: "AM-HIFU 难度预测",
  shortTitleEn: "AM-HIFU Nomogram",
  subtitle: "基于 MRI 与临床特征的子宫腺肌病 US-guided HIFU 高消融难度列线图模型",
  subtitleEn:
    "A nomogram based on MRI and clinical features for predicting high-difficulty US-guided HIFU ablation of adenomyosis",
  org: "川北医学院附属医院 · 微无创治疗团队",
  orgEn: "Affiliated Hospital of North Sichuan Medical College · Non-invasive Therapy Team",
  period: "2016.03 — 2024.03",
  nav: [
    { href: "/", label: bi("首页", "Home") },
    { href: "/assessment", label: bi("术前评估", "Risk Tool") },
    { href: "/overview", label: bi("成果总览", "Overview") },
    { href: "/methods", label: bi("研究方法", "Methods") },
    { href: "/results", label: bi("结果与证据", "Results") },
    { href: "/about", label: bi("关于与声明", "About") },
  ],
};

export const HEADLINE: { k: Bi; v: string; sub: Bi }[] = [
  { k: bi("AUC（训练集）", "AUC (training)"), v: "0.903", sub: bi("95% CI 0.867–0.939", "95% CI 0.867–0.939") },
  { k: bi("AUC（内部验证）", "AUC (internal validation)"), v: "0.923", sub: bi("95% CI 0.876–0.970", "95% CI 0.876–0.970") },
  { k: bi("纳入病例", "Enrolled cases"), v: "486", sub: bi("筛选 1032 例", "1,032 screened") },
  { k: bi("预测因子", "Predictors"), v: "6", sub: bi("LASSO 10 → 多因素 6", "LASSO 10 → logistic 6") },
];

export const PROBLEM: { t: Bi; d: Bi }[] = [
  {
    t: bi("疾病负担重", "Heavy disease burden"),
    d: bi(
      "子宫腺肌病（AM）在育龄期女性中的影像学患病率约 20%–35%，接受子宫切除者中组织学检出比例更高；月经过多、进行性痛经、慢性盆腔痛与不孕显著降低生活质量。",
      "Imaging-based prevalence of adenomyosis (AM) in women of reproductive age is about 20%–35%, and higher in hysterectomy specimens. Menorrhagia, progressive dysmenorrhoea, chronic pelvic pain and infertility markedly impair quality of life.",
    ),
  },
  {
    t: bi("HIFU 的取舍", "The HIFU trade-off"),
    d: bi(
      "超声引导高强度聚焦超声（US-guided HIFU）创伤小、恢复快、可保留子宫与潜在生育功能，但疗效高度依赖术中声窗、能量沉积与病灶异质性。",
      "US-guided HIFU is minimally invasive, recovers quickly and preserves the uterus and reproductive potential, yet effectiveness depends heavily on the acoustic window, energy deposition and lesion heterogeneity.",
    ),
  },
  {
    t: bi("术前无法量化", "No pre-operative quantification"),
    d: bi(
      "AM 病灶在体积、位置、血供与 MRI 信号上异质性明显，既往缺乏可在治疗前量化「这台手术有多难」的工具；单纯 NPVR 也不能反映能量消耗与操作复杂度。",
      "AM lesions vary widely in volume, location, vascularisation and MRI signal, and no tool previously quantified how difficult a given ablation would be; NPVR alone does not reflect energy consumption or procedural complexity.",
    ),
  },
];

export const PROBLEM_NOTE: Bi = bi(
  "本研究的切入点：把“经验判断”变成“术前可计算的分层”，让高难度病例在治疗前就被识别出来。",
  "Entry point of this study: turn experience-based judgement into a computable pre-operative stratification, so that difficult cases are identified before treatment.",
);

export const INNOVATIONS: { n: string; t: Bi; d: Bi }[] = [
  {
    n: "01",
    t: bi("综合消融难度评分（0–6 分）", "A composite ablation-difficulty score (0–6)"),
    d: bi(
      "不再单一使用 NPVR，而是把能效因子 EEF、治疗强度（s/h）与 NPVR 三项各按等级赋 0–2 分，总分 0–6；>3 分定义为高消融难度，贴近真实能量消耗与操作复杂度。",
      "Instead of NPVR alone, three indicators — energy enhancement factor (EEF), treatment intensity (s/h) and NPVR — are each graded 0–2 points for a total of 0–6; a score >3 defines high ablation difficulty, closely tracking real energy use and procedural complexity.",
    ),
  },
  {
    n: "02",
    t: bi("LASSO + 多因素 Logistic 双阶筛选", "Two-stage selection: LASSO then multivariable logistic"),
    d: bi(
      "13 个单因素候选（P<0.10）经 10 折交叉验证、按 1-SE 准则取 λ=0.034 筛出 10 个变量，再经多因素 Logistic 回归锁定独立预测因子，模型简约且稳健。",
      "Thirteen univariate candidates (P<0.10) were reduced to 10 by 10-fold cross-validation with the 1-SE rule (λ=0.034); multivariable logistic regression then retained independent predictors, keeping the model parsimonious and robust.",
    ),
  },
  {
    n: "03",
    t: bi("可在术前读数的列线图", "A nomogram readable before treatment"),
    d: bi(
      "年龄、子宫体积、腹壁厚度、Kishi 分型、T2WI 信号强度、T1WI 增强程度 6 项，全部可在治疗前 1 周的 MRI 与病史中获得，无需额外检查。",
      "Six variables — age, uterine volume, abdominal wall thickness, Kishi classification, T2WI signal intensity and T1WI enhancement — are all available from the MRI one week before treatment plus routine history, with no extra examination.",
    ),
  },
  {
    n: "04",
    t: bi("以临床净获益收尾的验证链", "A validation chain closing on net benefit"),
    d: bi(
      "区分度（ROC）+ 校准度（校准曲线）+ 临床实用性（DCA）三重评价，训练集阈值概率约 5%–80%、验证集约 5%–75% 区间内存在净获益。",
      "Discrimination (ROC), calibration (calibration curve) and clinical utility (DCA) were assessed together; net benefit was positive over threshold probabilities of roughly 5%–80% in training and 5%–75% in validation.",
    ),
  },
];

export const PIPELINE: { s: Bi; d: Bi }[] = [
  { s: bi("病例筛选", "Cohort screening"), d: bi("连续纳入 2016.03–2024.03 诊断 AM 并行 HIFU 消融的患者；1032 例筛除 546 例，最终 486 例。", "Consecutive patients with AM treated with HIFU ablation, 2016.03–2024.03; 1,032 screened, 546 excluded, 486 included.") },
  { s: bi("术前评估", "Pre-treatment work-up"), d: bi("治疗前 1 周内盆腔 MRI 平扫＋增强，记录腹壁厚度、子宫体积与位置、Kishi 分型、T1/T2 信号特征等。", "Pelvic MRI with contrast within one week before treatment; wall thickness, uterine volume and position, Kishi type and T1/T2 features recorded.") },
  { s: bi("治疗与量化", "Treatment & quantification"), d: bi("JC200 聚焦超声系统实时超声监控；记录功率、辐照与总能量；CEUS 即时评估，术后 24 h 增强 MRI 测 NPV。", "JC200 system under real-time ultrasound monitoring; power, sonation and total energy logged; CEUS assessed immediately, NPV measured on contrast MRI at 24 h.") },
  { s: bi("难度评分", "Difficulty scoring"), d: bi("EEF、治疗强度、NPVR 三项分级赋值 0–2 分，合计 0–6 分；>3 分为高难度。", "EEF, treatment intensity and NPVR graded 0–2 each, total 0–6; >3 defines high difficulty.") },
  { s: bi("建模验证", "Modelling & validation"), d: bi("7:3 随机划分训练/内部验证集；LASSO → 多因素 Logistic → 列线图 → ROC / 校准 / DCA。", "Random 7:3 split into training and internal validation sets; LASSO → multivariable logistic → nomogram → ROC / calibration / DCA.") },
];

const FACTORS_WHY: Bi[] = [
  bi("多有生育力保留需求，病灶活动性与血供通常更丰富，能量安全边界更窄。", "Fertility-sparing intent is common; lesions are more active and vascular, narrowing the safety margin for energy delivery."),
  bi("体积越小，病灶位置越深、盆腔声窗越受限，入射路径与靶区覆盖更难（列线图方向：体积越小分值越高）。", "Smaller uteri place lesions deeper with a more restricted pelvic window, making the beam path and target coverage harder (nomogram direction: smaller volume → more points)."),
  bi("腹壁越厚，超声衰减与去聚焦越明显，到达靶区的能量显著下降。", "A thicker abdominal wall attenuates and defocuses the beam, markedly reducing the energy reaching the target."),
  bi("Kishi IV 型（弥漫广泛型）累及范围广、边界不清，分区消融与计划复杂度更高。", "Kishi type IV (diffuse) involves a wide, ill-defined area, requiring multi-zone ablation and more complex planning."),
  bi("高信号提示腺体/出血成分为主，血供与热沉效应影响凝固性坏死的形成。", "High T2 signal suggests glandular/haemorrhagic components; perfusion and heat-sink effects impede coagulative necrosis."),
  bi("明显强化代表富血供，热清除效应强，是独立预测高消融难度的影像标志。", "Marked enhancement indicates rich vascularisation with strong heat clearance — an independent imaging marker of high difficulty."),
];

export const FACTORS = [
  { k: bi("年龄 < 35 岁", "Age < 35 years"), max: 38 },
  { k: bi("子宫体积", "Uterine volume"), max: 100 },
  { k: bi("腹壁厚度", "Abdominal wall thickness"), max: 81 },
  { k: bi("Kishi 分型", "Kishi classification"), max: 27 },
  { k: bi("T2WI 信号强度", "T2WI signal intensity"), max: 36 },
  { k: bi("T1WI 增强程度", "T1WI enhancement"), max: 18 },
].map((f, i) => ({ ...f, why: FACTORS_WHY[i] }));

export const APPLICATIONS: { t: Bi; d: Bi }[] = [
  { t: bi("患者筛选与适应证", "Case selection & indications"), d: bi("把「能不能做」细化为「做了有多难」，为高危患者提前设计替代或联合方案。", "Refine “can it be done” into “how hard will it be”, so alternative or combined plans can be designed in advance.") },
  { t: bi("术前医患沟通", "Pre-operative counselling"), d: bi("用概率与分值把不确定性量化，改善知情同意质量与期望管理。", "Quantify uncertainty with points and probability, improving informed consent and expectation management.") },
  { t: bi("治疗计划与能量预算", "Planning & energy budget"), d: bi("预估辐照时间、能量与分次策略，安排声窗准备（肠道准备、膀胱充盈、体位）。", "Estimate sonation time, energy and fractionation, and prepare the acoustic window (bowel preparation, bladder filling, positioning).") },
  { t: bi("手术排程与耗材", "Scheduling & resources"), d: bi("高难度病例预留更长治疗时段与影像复核资源，提高科室运转效率。", "Reserve longer slots and imaging review for difficult cases, improving departmental throughput.") },
];

export const LIMITS: Bi[] = [
  bi("单中心回顾性研究，样本来源单一，存在选择偏倚的固有风险。", "Single-centre retrospective design with one source of samples; inherent risk of selection bias."),
  bi("仅完成内部验证（随机 7:3），尚缺乏独立外部队列与前瞻性验证。", "Only internal validation (random 7:3); independent external and prospective validation are still lacking."),
  bi("难度评分中的 EEF 与治疗强度截断值来自训练集分布，跨中心设备/参数差异可能影响可比性。", "EEF and treatment-intensity cut-offs derive from the training-set distribution; cross-centre device and parameter differences may affect comparability."),
  bi("模型用于术前风险分层与沟通，不替代临床决策，也不能预测并发症发生率。", "The model is intended for pre-operative stratification and communication; it neither replaces clinical judgement nor predicts complication rates."),
];

export const EXCLUSIONS: { r: Bi; n: number }[] = [
  { r: bi("合并子宫肌瘤", "Concomitant uterine fibroids"), n: 366 },
  { r: bi("既往子宫/病灶手术史", "Previous uterine or lesion surgery"), n: 3 },
  { r: bi("GnRH-a / 激素治疗 ≤ 3 个月", "GnRH-a / hormone therapy ≤ 3 months"), n: 43 },
  { r: bi("资料不完整", "Incomplete data"), n: 134 },
];

export const LASSO_FACTORS: Bi[] = [
  bi("年龄", "Age"),
  bi("子宫体积", "Uterine volume"),
  bi("腹壁厚度", "Abdominal wall thickness"),
  bi("病灶中心距腹壁距离", "Distance from lesion centre to abdominal wall"),
  bi("子宫位置", "Uterine position"),
  bi("Kishi 分型", "Kishi classification"),
  bi("T2WI 信号强度", "T2WI signal intensity"),
  bi("T2WI 信号均匀程度", "T2WI signal homogeneity"),
  bi("T1WI 增强程度", "T1WI enhancement"),
  bi("T1WI 增强均匀程度", "T1WI enhancement homogeneity"),
];

export const REFS: string[] = [
  "Chapron C, et al. Diagnosing adenomyosis: an integrated clinical and imaging approach. Hum Reprod Update, 2020;26(3):392-411.",
  "Kishi Y, et al. Four subtypes of adenomyosis assessed by magnetic resonance imaging and their specification. Am J Obstet Gynecol, 2012;207(2):114.e1-7.",
  "Gong C, et al. Factors influencing the ablative efficiency of HIFU treatment for adenomyosis: a retrospective study. Int J Hyperthermia, 2016;32(5):496-503.",
  "Keserci B, Duc NM. MRI features influencing HIFU ablation of adenomyosis with NPVR ≥90% as measure of success. Int J Hyperthermia, 2018;35(1):626-636.",
  "Yu JW, et al. Factors influencing USgHIFU ablation for adenomyosis with NPVR ≥ 50. Int J Hyperthermia, 2023;40(1):2211753.",
  "Zhang Y, et al. A novel scoring system based on MRI for the prediction of the difficulty of US-guided HIFU ablation for uterine fibroids. Int J Hyperthermia, 2024;41(1):2386098.",
  "Collins GS, et al. Evaluation of clinical prediction models (part 1): from development to external validation. BMJ, 2024;384:e074819.",
];
