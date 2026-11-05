import type { PickerOption } from '../../core/components/PickerField';

export type WarehouseTypeFamily =
  | 'raw_material'
  | 'wip'
  | 'finished_goods'
  | 'general'
  | 'line_side'
  | 'defective';

const RAW_WAREHOUSE_ALIASES = [
  'raw_material',
  'raw',
  'cold_raw',
  'raw_controlled',
  'dry_storage',
  '原料仓',
  '原材料仓',
] as const;

const WIP_WAREHOUSE_ALIASES = ['wip', 'semi', 'semi_finished', '在制品仓', '半成品仓'] as const;

const FINISHED_WAREHOUSE_ALIASES = [
  'finished_goods',
  'finished',
  'finished_warehouse',
  'cold_finished',
  'finished_temp_ctrl',
  'sterile_storage',
  'finished_chem',
  'finished_uv',
  'warehouse_medical',
  '成品仓',
  '成品库',
  '产成品仓',
  '产成品库',
] as const;

const GENERAL_WAREHOUSE_ALIASES = [
  'general',
  'packaging_wh',
  'quarantine',
  'hazmat_wh',
  'flammable_wh',
  'general_chem',
  'ink_storage_wh',
  'substrate_wh',
  'consumable_wh',
] as const;

const LINE_SIDE_WAREHOUSE_ALIASES = ['line_side', 'lineside', 'line-side', '线边仓'] as const;

const DEFECTIVE_WAREHOUSE_ALIASES = ['defective', 'defect', '不良仓', '报废仓'] as const;

const WAREHOUSE_TYPE_ALIASES: Record<WarehouseTypeFamily, readonly string[]> = {
  raw_material: RAW_WAREHOUSE_ALIASES,
  wip: WIP_WAREHOUSE_ALIASES,
  finished_goods: FINISHED_WAREHOUSE_ALIASES,
  general: GENERAL_WAREHOUSE_ALIASES,
  line_side: LINE_SIDE_WAREHOUSE_ALIASES,
  defective: DEFECTIVE_WAREHOUSE_ALIASES,
};

function normalizeWarehouseTypeInput(type?: string | null): string {
  return type?.trim().toLowerCase() ?? '';
}

function containsKeyword(raw: string, normalized: string, keyword: string): boolean {
  const key = keyword.toLowerCase();
  const isAsciiKeyword = /^[a-z_-]+$/.test(key);
  return isAsciiKeyword ? normalized.includes(key) : raw.includes(keyword);
}

export function getWarehouseTypeFamily(type?: string | null): WarehouseTypeFamily | '' {
  const raw = type?.trim() ?? '';
  const normalized = normalizeWarehouseTypeInput(type);
  if (!normalized) return '';

  if (
    RAW_WAREHOUSE_ALIASES.includes(normalized as (typeof RAW_WAREHOUSE_ALIASES)[number]) ||
    containsKeyword(raw, normalized, 'raw') ||
    containsKeyword(raw, normalized, '原料')
  ) {
    return 'raw_material';
  }

  if (
    WIP_WAREHOUSE_ALIASES.includes(normalized as (typeof WIP_WAREHOUSE_ALIASES)[number]) ||
    containsKeyword(raw, normalized, 'semi') ||
    containsKeyword(raw, normalized, 'wip') ||
    containsKeyword(raw, normalized, '半成品') ||
    containsKeyword(raw, normalized, '在制品')
  ) {
    return 'wip';
  }

  if (
    FINISHED_WAREHOUSE_ALIASES.includes(
      normalized as (typeof FINISHED_WAREHOUSE_ALIASES)[number],
    ) ||
    containsKeyword(raw, normalized, 'finished') ||
    containsKeyword(raw, normalized, '成品') ||
    containsKeyword(raw, normalized, '产成品')
  ) {
    return 'finished_goods';
  }

  if (
    LINE_SIDE_WAREHOUSE_ALIASES.includes(
      normalized as (typeof LINE_SIDE_WAREHOUSE_ALIASES)[number],
    ) ||
    containsKeyword(raw, normalized, 'line_side') ||
    containsKeyword(raw, normalized, 'lineside') ||
    containsKeyword(raw, normalized, 'line-side') ||
    containsKeyword(raw, normalized, '线边')
  ) {
    return 'line_side';
  }

  if (
    DEFECTIVE_WAREHOUSE_ALIASES.includes(
      normalized as (typeof DEFECTIVE_WAREHOUSE_ALIASES)[number],
    ) ||
    containsKeyword(raw, normalized, 'defect') ||
    containsKeyword(raw, normalized, '不良') ||
    containsKeyword(raw, normalized, '报废')
  ) {
    return 'defective';
  }

  if (
    GENERAL_WAREHOUSE_ALIASES.includes(normalized as (typeof GENERAL_WAREHOUSE_ALIASES)[number]) ||
    containsKeyword(raw, normalized, 'general') ||
    containsKeyword(raw, normalized, '通用')
  ) {
    return 'general';
  }

  return '';
}

export function getWarehouseTypeAliases(type?: string | null): string[] {
  const family = getWarehouseTypeFamily(type);
  return family ? [...WAREHOUSE_TYPE_ALIASES[family]] : [];
}

export function isLineSideWarehouseType(type?: string | null): boolean {
  return getWarehouseTypeFamily(type) === 'line_side';
}

export function resolveWarehouseTypeOptionValue(
  type: string | null | undefined,
  options: PickerOption[],
  fallbackValue?: string,
): string {
  const normalized = normalizeWarehouseTypeInput(type);
  if (!normalized) return fallbackValue ?? '';

  const exactMatch = options.find(
    (option) => normalizeWarehouseTypeInput(option.value) === normalized,
  );
  if (exactMatch) return exactMatch.value;

  const family = getWarehouseTypeFamily(type);
  if (!family) return type?.trim() ?? fallbackValue ?? '';

  const aliases = new Set(getWarehouseTypeAliases(family).map(normalizeWarehouseTypeInput));
  const aliasMatch = options.find((option) =>
    aliases.has(normalizeWarehouseTypeInput(option.value)),
  );
  if (aliasMatch) return aliasMatch.value;

  const familyMatch = options.find((option) => getWarehouseTypeFamily(option.value) === family);
  if (familyMatch) return familyMatch.value;

  return type?.trim() ?? fallbackValue ?? '';
}

export function getWarehouseTypeFallbackLabel(type?: string | null): string {
  const family = getWarehouseTypeFamily(type);
  if (family === 'raw_material') return '原材料库';
  if (family === 'wip') return '在制品库';
  if (family === 'finished_goods') return '成品库';
  if (family === 'line_side') return '线边仓';
  if (family === 'defective') return '不良仓';
  if (family === 'general') return '通用仓';
  return type?.trim() || '-';
}
