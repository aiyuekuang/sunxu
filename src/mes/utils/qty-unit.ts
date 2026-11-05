import { formatNumber, type FormatNumberOptions } from '../../core/utils/format';
import { type DictLabelMap, resolveDictLabel } from '../../core/utils/dict-label-map';

export type UnitLabelMap = DictLabelMap;

export const UNKNOWN_UNIT_LABEL = '未知单位';

export interface UnitOption {
  label: string;
  value: string;
}

export function normalizeUnit(value?: string | null): string {
  return value?.trim() || '';
}

export function formatUnitLabel(
  unit: string | null | undefined,
  unitLabelMap: UnitLabelMap = {},
): string {
  return resolveDictLabel(unit, unitLabelMap, { unknownLabel: UNKNOWN_UNIT_LABEL });
}

export function formatQtyWithUnit(
  value: number | string | null | undefined,
  unit: string | null | undefined,
  unitLabelMap: UnitLabelMap = {},
  options: FormatNumberOptions = {},
): string {
  const quantity = formatNumber(value, options);
  const unitLabel = formatUnitLabel(unit, unitLabelMap);
  return unitLabel ? `${quantity} ${unitLabel}` : quantity;
}

/** 报表使用物料档案保存的单位值，避免把英文单位代码替换成字典标签。 */
export function formatQtyWithRawUnit(
  value: number | string | null | undefined,
  unit: string | null | undefined,
  options: FormatNumberOptions = {},
): string {
  const quantity = formatNumber(value, options);
  const normalizedUnit = normalizeUnit(unit);
  return normalizedUnit ? `${quantity} ${normalizedUnit}` : quantity;
}

/** 为历史选中值补齐 Picker 选项，显示文案仍统一经过单位解析。 */
export function ensureUnitOption<T extends UnitOption>(
  options: readonly T[],
  unit: string | null | undefined,
  unitLabelMap: UnitLabelMap,
): T[] {
  const normalized = normalizeUnit(unit);
  if (!normalized || options.some((item) => item.value === normalized)) return [...options];

  const label = formatUnitLabel(normalized, unitLabelMap) || '单位加载中';
  return [{ label, value: normalized } as T, ...options];
}
