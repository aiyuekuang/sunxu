export type PlanQuantityMode = 'rate-driven' | 'qty-driven';

export function roundTo(value: number, places: number): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

export function ceilTo(value: number, places: number): number {
  const multiplier = 10 ** places;
  const scaled = value * multiplier;
  // 抹掉浮点表示残差，避免 6000×(1+10/100)=6600.000000000001 被向上取整成 6600.0001。
  // 与后端 number.util.ts 的 ceilToDecimal 保持一致（相对 epsilon 容差）。
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(scaled));
  return Math.ceil(scaled - epsilon) / multiplier;
}

export function derivePlannedQty(requiredQty: number, plannedLossRate: number): number {
  return ceilTo(requiredQty * (1 + plannedLossRate / 100), 4);
}

export function derivePlannedLossRate(requiredQty: number, plannedQty: number): number {
  if (!(requiredQty > 0)) return 0;
  return roundTo((plannedQty / requiredQty - 1) * 100, 2);
}

export function matchesRateDriven(
  requiredQty: number,
  plannedQty: number,
  plannedLossRate: number,
): boolean {
  return derivePlannedQty(requiredQty, plannedLossRate) === roundTo(plannedQty, 4);
}
