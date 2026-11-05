export interface AmountPolicySnapshotSummary {
  domain?: string;
  documentType?: string;
  policyCode: string;
  version?: number | null;
  amountFormula?: string | null;
  amountFormulaReadable?: string | null;
  pricingQuantity?: number | null;
  baseAmount?: number | null;
  formulaDifferenceAmount?: number | null;
  amount?: number | null;
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveAmountPolicySnapshot(
  priceSnapshot: unknown,
): AmountPolicySnapshotSummary | null {
  const root = readRecord(priceSnapshot);
  const sourcePriceSnapshot = readRecord(root.priceSnapshot);
  const nested = readRecord(root.amountPolicySnapshot);
  const sourceNested = readRecord(sourcePriceSnapshot.amountPolicySnapshot);
  const snapshot =
    Object.keys(nested).length > 0
      ? nested
      : Object.keys(sourceNested).length > 0
        ? sourceNested
        : Object.keys(sourcePriceSnapshot).length > 0
          ? sourcePriceSnapshot
          : root;
  const policyCode = readString(snapshot.policyCode);
  if (!policyCode) return null;

  const result = readRecord(snapshot.result);
  const version = readNumber(snapshot.version);

  return {
    domain: readString(snapshot.domain),
    documentType: readString(snapshot.documentType),
    policyCode,
    version,
    amountFormula: readString(snapshot.amountFormula) ?? null,
    amountFormulaReadable: readString(snapshot.amountFormulaReadable) ?? null,
    pricingQuantity: readNumber(result.pricingQuantity),
    baseAmount: readNumber(result.baseAmount),
    formulaDifferenceAmount: readNumber(result.formulaDifferenceAmount),
    amount: readNumber(result.amount),
  };
}
