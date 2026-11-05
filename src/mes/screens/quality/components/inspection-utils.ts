import type { TemplateItem } from '../../../host/services';
import type { ChipOption } from '../../../../core/components/ChipSelectField.tsx';
import {
  INSPECTION_RECORD_TYPE_CONFIG,
  ROUTINE_INSPECTION_TYPE_CONFIG,
} from '../../../constants/status-configs';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InspectableItem {
  resultType?: 'numeric' | 'judgement' | 'selection' | 'text';
  standard?: string | null;
  upperLimit?: number | null;
  lowerLimit?: number | null;
  unit?: string | null;
  options?: string[] | null;
  acceptedValues?: string[] | null;
}

export interface ItemResult {
  item: TemplateItem;
  value: string;
  pass: boolean | null;
}

export type InspectionQtyField = 'sampleQty' | 'passQty' | 'failQty';
export const INSPECTION_QTY_PRECISION = 4;
export const INSPECTION_QTY_MIN = 0.0001;

export function getInspectionRecordTypeLabel(
  inspectionType: string,
  recordType?: string | null,
): string {
  if (!recordType) return '-';
  if (recordType === 'other') {
    return ROUTINE_INSPECTION_TYPE_CONFIG[inspectionType] ?? '其他检查';
  }

  const label = INSPECTION_RECORD_TYPE_CONFIG[recordType]?.label ?? recordType;
  return inspectionType === 'ipqc' || recordType === 'recheck' ? label : `${label}（历史记录）`;
}

const roundInspectionQty = (value: number) =>
  Math.round(value * 10 ** INSPECTION_QTY_PRECISION) / 10 ** INSPECTION_QTY_PRECISION;

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * @enum 代码逻辑依赖，不可改为字典
 * 原因：后端 quality.service.ts 中 FQC 通过→自动完工入库，IQC/FQC/OQC 拒绝→批号隔离
 * 审计日期：2026-04-02
 */
export const TYPE_OPTIONS: ChipOption[] = [
  { value: 'iqc', label: '来料检验(IQC)' },
  { value: 'ipqc', label: '过程检验(IPQC)' },
  { value: 'fqc', label: '成品检验(FQC)' },
  { value: 'oqc', label: '出货检验(OQC)' },
];

export const INSPECTION_TYPE_TIPS: Record<string, string> = {
  iqc: '原材料/零件刚到货时检查，确认供应商送来的东西合不合格',
  ipqc: '生产过程中抽检，及时发现问题避免一整批报废',
  fqc: '产品做完后的最终检查，确认成品达标才能入库',
  oqc: '发货前最后一道检查，确保客户收到的是合格品',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Whether an item has numeric limits (determines keyboard type & evaluation) */
export function hasNumericLimits(item: InspectableItem): boolean {
  return item.upperLimit != null || item.lowerLimit != null;
}

export function hasAutomaticInspectionJudgement(item: InspectableItem): boolean {
  return (
    (item.resultType === 'numeric' && hasNumericLimits(item)) ||
    (item.resultType === 'selection' && (item.acceptedValues?.length ?? 0) > 0)
  );
}

/** Evaluate a single inspection item against its spec */
export function evaluateItem(item: InspectableItem, value: string): boolean | null {
  if (!value.trim()) return null;

  if (item.resultType === 'selection') {
    if (!item.options?.includes(value)) return false;
    return item.acceptedValues?.length ? item.acceptedValues.includes(value) : null;
  }
  if (item.resultType !== 'numeric') return null;

  const hasUpper = item.upperLimit != null;
  const hasLower = item.lowerLimit != null;

  if (hasUpper || hasLower) {
    const num = Number(value);
    const upperLimit = hasUpper ? item.upperLimit : undefined;
    const lowerLimit = hasLower ? item.lowerLimit : undefined;
    if (!Number.isFinite(num)) return false;
    return (upperLimit == null || num <= upperLimit) && (lowerLimit == null || num >= lowerLimit);
  }

  return null;
}

/** Format spec label for display */
export function specLabel(item: InspectableItem): string {
  const hasUpper = item.upperLimit != null;
  const hasLower = item.lowerLimit != null;
  const unit = item.unit ?? '';

  if (hasLower && hasUpper) return `${item.lowerLimit} ~ ${item.upperLimit} ${unit}`.trim();
  if (hasUpper) return `≤ ${item.upperLimit} ${unit}`.trim();
  if (hasLower) return `≥ ${item.lowerLimit} ${unit}`.trim();
  return item.standard ?? '';
}

export function deriveInspectionConclusion(params: {
  passQty: number;
  failQty: number;
  hasFailedItem: boolean;
}): 'passed' | 'rejected' {
  const { failQty, hasFailedItem } = params;
  return failQty > 0 || hasFailedItem ? 'rejected' : 'passed';
}

export function hasCompleteInspectionQuantities(params: {
  sampleQty?: unknown;
  passQty?: unknown;
  failQty?: unknown;
}): boolean {
  const sampleQty = normalizeQtyValue(params.sampleQty);
  const passQty = normalizeQtyValue(params.passQty);
  const failQty = normalizeQtyValue(params.failQty);
  if (sampleQty === undefined || passQty === undefined || failQty === undefined) {
    return false;
  }
  return (
    sampleQty >= INSPECTION_QTY_MIN &&
    passQty >= 0 &&
    failQty >= 0 &&
    isInspectionQtyClosed(sampleQty, passQty, failQty)
  );
}

export function normalizeInspectionQty(value: unknown): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return undefined;
  return roundInspectionQty(numericValue);
}

export function formatInspectionQtyInputValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function normalizeQtyValue(value: unknown): number | undefined {
  const normalizedValue = normalizeInspectionQty(value);
  if (normalizedValue === undefined) return undefined;
  return Math.max(0, normalizedValue);
}

function clampQty(value: number, sampleQty: number): number {
  return roundInspectionQty(Math.max(0, Math.min(value, sampleQty)));
}

export function isInspectionQtyClosed(
  sampleQty: number,
  passQty: number,
  failQty: number,
): boolean {
  return roundInspectionQty(passQty + failQty) === roundInspectionQty(sampleQty);
}

export function deriveInspectionQuantitiesFromPass(params: {
  sampleQty?: unknown;
  passQty?: unknown;
}): Pick<Record<InspectionQtyField, number | undefined>, 'passQty' | 'failQty'> {
  const sampleQty = normalizeQtyValue(params.sampleQty);
  const passQty = normalizeQtyValue(params.passQty);
  if (passQty === undefined) {
    return { passQty: undefined, failQty: undefined };
  }
  if (sampleQty === undefined) {
    return { passQty, failQty: undefined };
  }
  const nextPassQty = clampQty(passQty, sampleQty);
  return {
    passQty: nextPassQty,
    failQty: roundInspectionQty(sampleQty - nextPassQty),
  };
}

export function autoFillInspectionQuantities(params: {
  sampleQty?: unknown;
  passQty?: unknown;
  failQty?: unknown;
  changedField: InspectionQtyField;
  preferredField?: 'passQty' | 'failQty';
}): Partial<Record<InspectionQtyField, number | undefined>> {
  const sampleQty = normalizeQtyValue(params.sampleQty);
  const passQty = normalizeQtyValue(params.passQty);
  const failQty = normalizeQtyValue(params.failQty);

  if (params.changedField === 'passQty') {
    if (passQty === undefined) {
      return { passQty: undefined, failQty: undefined };
    }
    if (sampleQty === undefined) return { passQty };
    const nextPassQty = clampQty(passQty, sampleQty);
    return { passQty: nextPassQty, failQty: sampleQty - nextPassQty };
  }

  if (params.changedField === 'failQty') {
    if (failQty === undefined) {
      return { passQty: undefined, failQty: undefined };
    }
    if (sampleQty === undefined) return { failQty };
    const nextFailQty = clampQty(failQty, sampleQty);
    return { passQty: sampleQty - nextFailQty, failQty: nextFailQty };
  }

  if (sampleQty === undefined) {
    return { sampleQty: undefined };
  }

  const preferFailQty = params.preferredField === 'failQty';
  if (preferFailQty && failQty !== undefined) {
    const nextFailQty = clampQty(failQty, sampleQty);
    return { passQty: sampleQty - nextFailQty, failQty: nextFailQty };
  }
  if (passQty !== undefined) {
    const nextPassQty = clampQty(passQty, sampleQty);
    return { passQty: nextPassQty, failQty: sampleQty - nextPassQty };
  }
  if (failQty !== undefined) {
    const nextFailQty = clampQty(failQty, sampleQty);
    return { passQty: sampleQty - nextFailQty, failQty: nextFailQty };
  }

  return {};
}
