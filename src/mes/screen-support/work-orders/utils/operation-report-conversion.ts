type OperationReportRoundingMode = 'none' | 'ceil' | 'round' | 'floor';

export interface OperationReportConversionInput {
  operationOutputMode?: string | null;
  operationReportUnit?: string | null;
  operationReportBaseProductQty?: number | null;
  operationReportTargetQty?: number | null;
  operationReportRoundingMode?: OperationReportRoundingMode | string | null;
  operationReportPrecision?: number | null;
  operationReportAffectsOutput?: boolean | null;
}

const DEFAULT_PRODUCT_UNIT = '产品单位';
const DEFAULT_PRECISION = 4;

function toPositiveNumber(value: number | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function normalizePrecision(value: number | null | undefined): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.min(Math.max(Math.trunc(numeric), 0), 8);
}

function normalizeRoundingMode(
  value: OperationReportRoundingMode | string | null | undefined,
): OperationReportRoundingMode {
  return value === 'ceil' || value === 'round' || value === 'floor' ? value : 'none';
}

export function formatOperationReportQty(value: number | null | undefined): string {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0';
  return Number(numeric.toFixed(DEFAULT_PRECISION)).toString();
}

export function getOperationReportUnit(
  input: OperationReportConversionInput,
  productUnit?: string | null,
): string {
  return input.operationReportUnit?.trim() || productUnit?.trim() || DEFAULT_PRODUCT_UNIT;
}

export function convertOperationQtyToProductQty(
  reportedOperationQty: number | null | undefined,
  input: OperationReportConversionInput,
): number {
  const reportedQty = Number(reportedOperationQty ?? 0);
  if (!Number.isFinite(reportedQty) || reportedQty <= 0) return 0;
  const baseQty = toPositiveNumber(input.operationReportBaseProductQty);
  const targetQty = toPositiveNumber(input.operationReportTargetQty);
  return roundOperationReportQty((reportedQty / targetQty) * baseQty, input);
}

export function convertProductQtyToOperationQty(
  productQty: number | null | undefined,
  input: OperationReportConversionInput,
): number {
  const quantity = Number(productQty ?? 0);
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  const baseQty = toPositiveNumber(input.operationReportBaseProductQty);
  const targetQty = toPositiveNumber(input.operationReportTargetQty);
  return roundOperationReportQty((quantity / baseQty) * targetQty, input);
}

export function roundOperationReportQty(
  value: number,
  input: OperationReportConversionInput,
): number {
  if (!Number.isFinite(value)) return 0;
  const precision = normalizePrecision(input.operationReportPrecision);
  if (precision === null) return Number(value.toFixed(DEFAULT_PRECISION));
  const factor = 10 ** precision;
  const scaled = value * factor;
  const mode = normalizeRoundingMode(input.operationReportRoundingMode);
  if (mode === 'ceil') return Math.ceil(scaled - Number.EPSILON) / factor;
  if (mode === 'floor') return Math.floor(scaled + Number.EPSILON) / factor;
  if (mode === 'round') return Math.round(scaled) / factor;
  return Number(value.toFixed(Math.min(precision, DEFAULT_PRECISION)));
}

export function buildOperationReportSummary(
  input: OperationReportConversionInput,
  productUnit?: string | null,
): string {
  const displayProductUnit = productUnit?.trim() || DEFAULT_PRODUCT_UNIT;
  const reportUnit = getOperationReportUnit(input, productUnit);
  return `生产 ${formatOperationReportQty(
    toPositiveNumber(input.operationReportBaseProductQty),
  )} ${displayProductUnit}，本工序报工 ${formatOperationReportQty(
    toPositiveNumber(input.operationReportTargetQty),
  )} ${reportUnit}`;
}
