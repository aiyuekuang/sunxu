interface ReceiptAllocationAmount {
  allocatedAmount?: number | null;
  allocatedTaxAmount?: number | null;
}

interface ReceiptLandedCostAmounts {
  allocations?: readonly ReceiptAllocationAmount[];
}

export interface ReceiptLandedCostAllocationSummary {
  /** 不含税、实际计入当前采购入库单存货成本的金额。 */
  allocatedAmount: number;
  /** 当前采购入库单对应的可抵扣/进项税快照；尚无税务数据时为 0。 */
  allocatedTaxAmount: number;
}

function toFiniteNumber(value: number | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

/**
 * `by-receipt` 接口已将每张分摊单的 allocations 收敛到当前采购入库单。
 * 因此移动端必须展示 allocations 合计，而不是单头总金额，避免多张入库单共摊时错报本单成本。
 */
export function getReceiptLandedCostAllocationSummary(
  landedCost: ReceiptLandedCostAmounts,
): ReceiptLandedCostAllocationSummary {
  return (landedCost.allocations ?? []).reduce<ReceiptLandedCostAllocationSummary>(
    (summary, allocation) => ({
      allocatedAmount: summary.allocatedAmount + toFiniteNumber(allocation.allocatedAmount),
      allocatedTaxAmount:
        summary.allocatedTaxAmount + toFiniteNumber(allocation.allocatedTaxAmount),
    }),
    { allocatedAmount: 0, allocatedTaxAmount: 0 },
  );
}
