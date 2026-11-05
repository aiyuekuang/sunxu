export interface CommercialLineAmountInput {
  quantity: number | string | null | undefined;
  unitPrice: number | string | null | undefined;
  discountRate?: number | string | null;
  taxRate?: number | string | null;
  priceIncludesTax?: boolean | null;
}

export interface CommercialLineAmountResult {
  amount: number | null;
  discountRate: number;
  discountAmount: number | null;
  discountedAmount: number | null;
  taxRate: number;
  taxAmount: number | null;
  totalAmount: number | null;
}

export interface CommercialLinePayloadSource {
  unitPrice?: number | string | null;
  discountRate?: number | string | null;
  taxRate?: number | string | null;
  priceIncludesTax?: boolean | null;
  currency?: string | null;
  supplierPriceTierId?: string | null;
  amount?: unknown;
  discountAmount?: unknown;
  discountedAmount?: unknown;
  taxAmount?: unknown;
  totalAmount?: unknown;
}

export type CommercialLinePayloadFields = Partial<{
  unitPrice: number;
  discountRate: number;
  taxRate: number;
  priceIncludesTax: boolean;
  currency: string;
  supplierPriceTierId: string;
}>;

export interface BuildCommercialLinePayloadOptions {
  canManagePrice: boolean;
}

function roundToDecimal(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function normalizeRequiredNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOptionalNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRate(
  value: number | string | null | undefined,
  defaultValue: number,
  fieldName: string,
): number {
  const raw = normalizeOptionalNumber(value);
  const parsed = raw !== null && raw > 0 && raw < 1 ? raw * 100 : (raw ?? defaultValue);
  if (parsed < 0 || parsed > 100) {
    throw new RangeError(`${fieldName} must be between 0 and 100`);
  }
  return roundToDecimal(parsed, 4);
}

export function parseOptionalCommercialNumber(
  value: number | string | null | undefined,
): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function formatCommercialNumberInput(value: number | string | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

export function calculateCommercialLineAmounts(
  input: CommercialLineAmountInput,
): CommercialLineAmountResult {
  const discountRate = normalizeRate(input.discountRate, 100, 'discountRate');
  const taxRate = normalizeRate(input.taxRate, 0, 'taxRate');
  const unitPrice = normalizeOptionalNumber(input.unitPrice);

  if (unitPrice === null) {
    return {
      amount: null,
      discountRate,
      discountAmount: null,
      discountedAmount: null,
      taxRate,
      taxAmount: null,
      totalAmount: null,
    };
  }

  const quantity = normalizeRequiredNumber(input.quantity);
  const amount = roundToDecimal(quantity * unitPrice, 2);
  const discountedGrossOrNetAmount = roundToDecimal(amount * (discountRate / 100), 2);
  const discountAmount = roundToDecimal(amount - discountedGrossOrNetAmount, 2);

  if (input.priceIncludesTax === true && taxRate > 0) {
    const totalAmount = discountedGrossOrNetAmount;
    const taxAmount = roundToDecimal(totalAmount * (taxRate / (100 + taxRate)), 2);
    return {
      amount,
      discountRate,
      discountAmount,
      discountedAmount: roundToDecimal(totalAmount - taxAmount, 2),
      taxRate,
      taxAmount,
      totalAmount,
    };
  }

  const discountedAmount = discountedGrossOrNetAmount;
  const taxAmount = roundToDecimal(discountedAmount * (taxRate / 100), 2);
  return {
    amount,
    discountRate,
    discountAmount,
    discountedAmount,
    taxRate,
    taxAmount,
    totalAmount: roundToDecimal(discountedAmount + taxAmount, 2),
  };
}

export function buildCommercialLinePayloadFields(
  item: CommercialLinePayloadSource,
  options: BuildCommercialLinePayloadOptions,
): CommercialLinePayloadFields {
  if (!options.canManagePrice) {
    return {};
  }

  const payload: CommercialLinePayloadFields = {};
  const unitPrice = parseOptionalCommercialNumber(item.unitPrice);
  const discountRate = parseOptionalCommercialNumber(item.discountRate);
  const taxRate = parseOptionalCommercialNumber(item.taxRate);
  const currency = item.currency?.trim();
  const supplierPriceTierId = item.supplierPriceTierId?.trim();

  if (unitPrice !== undefined) {
    payload.unitPrice = unitPrice;
  }
  if (discountRate !== undefined) {
    payload.discountRate = discountRate;
  }
  if (taxRate !== undefined) {
    payload.taxRate = taxRate;
  }
  if (typeof item.priceIncludesTax === 'boolean') {
    payload.priceIncludesTax = item.priceIncludesTax;
  }
  if (currency) {
    payload.currency = currency;
  }
  if (supplierPriceTierId) {
    payload.supplierPriceTierId = supplierPriceTierId;
  }
  return payload;
}
