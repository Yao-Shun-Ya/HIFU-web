/** 统计辅助：正态分布、ROC（双正态模型）、校准曲线、DCA 净获益 */

export const erf = (x: number): number => {
  const s = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return s * y;
};

export const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));

/** Acklam 逆正态分布 */
export const PhiInv = (p: number): number => {
  if (p <= 0) return -8;
  if (p >= 1) return 8;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400734525285956, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671211213259e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pl) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const qMid = p - 0.5;
  const rMid = qMid * qMid;
  return (((((a[0] * rMid + a[1]) * rMid + a[2]) * rMid + a[3]) * rMid + a[4]) * rMid + a[5]) * qMid /
    (((((b[0] * rMid + b[1]) * rMid + b[2]) * rMid + b[3]) * rMid + b[4]) * rMid + 1);
};

export const logit = (p: number) => Math.log(p / (1 - p));
export const expit = (x: number) => 1 / (1 + Math.exp(-x));

/** 双正态模型下，给定 AUC 求组间均值间距（方差相等） */
export const separation = (auc: number) => Math.SQRT2 * PhiInv(auc);

/** 由 AUC 生成 ROC 曲线（双正态） */
export function rocPoints(auc: number, n = 60): { x: number; y: number }[] {
  const d = separation(auc);
  const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  for (let i = 0; i <= n; i++) {
    const c = d + 2.6 - (i / n) * (d + 5.2);
    pts.push({ x: Phi(-c), y: Phi(d - c) });
  }
  pts.push({ x: 1, y: 1 });
  return pts.filter((p) => p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1);
}

/** DCA：模型 / 全部干预 / 不干预 的净获益曲线 */
export function dcaPoints(
  auc: number,
  prevalence: number,
  steps = 60,
): { pt: number; model: number; all: number }[] {
  const d = separation(auc);
  const out: { pt: number; model: number; all: number }[] = [];
  for (let i = 1; i <= steps; i++) {
    const pt = i / (steps + 1);
    const xStar = (logit(pt) - logit(prevalence) + (d * d) / 2) / (2 * d);
    const sens = Phi(d - xStar);
    const fpr = Phi(-xStar);
    const model = prevalence * sens - (1 - prevalence) * fpr * (pt / (1 - pt));
    const all = prevalence - (1 - prevalence) * (pt / (1 - pt));
    out.push({ pt, model: Math.max(model, 0), all: Math.max(all, 0) });
  }
  return out;
}

/**
 * 校准曲线（示意）：预测概率按斜率 slope 离散化后对应的观察比例。
 * slope > 1 表示预测偏极端（轻度乐观），即高估高危、低估低危。
 */
export function calibrationPoints(
  slope = 1.12,
  steps = 26,
  lo = 0.02,
  hi = 0.98,
): { pred: number; obs: number }[] {
  const out: { pred: number; obs: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const pred = lo + (i / steps) * (hi - lo);
    out.push({ pred, obs: expit(logit(pred) / slope) });
  }
  return out;
}
