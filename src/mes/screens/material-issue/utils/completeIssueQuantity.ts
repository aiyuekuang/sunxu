const ISSUE_QTY_DECIMAL_PRECISION = 4;

function roundIssueQty(value: number): number {
  return Number(value.toFixed(ISSUE_QTY_DECIMAL_PRECISION));
}

/**
 * 将仓管录入的实发数量折算为基础库存单位，仅用于端侧预校验。
 * 最终换算、库存扣减与数量一致性校验仍由确认发料接口在事务内完成。
 */
export function resolveCompleteIssueBaseQty(
  inputQty: string | number,
  inputUnit: string,
  baseUnit: string,
  unitFactors?: Record<string, number>,
): number | null {
  const qty = Number(inputQty);
  const unit = inputUnit.trim();
  if (!Number.isFinite(qty) || qty < 0 || !unit || !baseUnit) return null;
  if (unit === baseUnit) return roundIssueQty(qty);

  const factor = Number(unitFactors?.[unit] ?? 0);
  if (!Number.isFinite(factor) || factor <= 0) return null;
  return roundIssueQty(qty * factor);
}

/** 切换录入单位时保持基础库存实际发料量不变。 */
export function convertCompleteIssueQtyToUnit(
  baseQty: number,
  nextUnit: string,
  baseUnit: string,
  unitFactors?: Record<string, number>,
): number | null {
  if (!Number.isFinite(baseQty) || baseQty < 0 || !nextUnit || !baseUnit) {
    return null;
  }
  const factor = nextUnit === baseUnit ? 1 : Number(unitFactors?.[nextUnit] ?? 0);
  if (!Number.isFinite(factor) || factor <= 0) return null;
  return roundIssueQty(baseQty / factor);
}

/** 数值输入框使用普通小数字符串，避免暴露科学计数法。 */
export function formatCompleteIssueQtyInput(qty: number): string {
  if (!Number.isFinite(qty)) return '';
  return String(roundIssueQty(qty));
}
