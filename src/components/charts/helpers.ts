export interface Pt {
  x: number;
  y: number;
}

export const linePath = (pts: Pt[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

export const areaPath = (pts: Pt[]) =>
  `${linePath(pts)} L${pts[pts.length - 1].x},${pts[pts.length - 1].y}`;

export function makeScale(d0: number, d1: number, r0: number, r1: number) {
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

export const ticks = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
};
