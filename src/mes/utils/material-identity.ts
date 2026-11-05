import { formatUnitLabel, type UnitLabelMap } from './qty-unit';

export interface MaterialIdentityLike {
  material?: {
    code?: string | null;
    name?: string | null;
    spec?: string | null;
    unit?: string | null;
  } | null;
  materialCode?: string | null;
  materialName?: string | null;
  materialSpec?: string | null;
  spec?: string | null;
  materialUnit?: string | null;
  unit?: string | null;
  baseUnit?: string | null;
  code?: string | null;
  name?: string | null;
}

function firstNonBlank(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const normalized = value?.trim();
    if (normalized) return normalized;
  }
  return '';
}

export function getMaterialCode(record: MaterialIdentityLike): string {
  return firstNonBlank(record.materialCode, record.material?.code, record.code);
}

export function getMaterialName(record: MaterialIdentityLike): string {
  return firstNonBlank(record.materialName, record.material?.name, record.name);
}

export function getMaterialSpec(record: MaterialIdentityLike): string {
  return firstNonBlank(record.materialSpec, record.material?.spec, record.spec);
}

export function getMaterialUnit(record: MaterialIdentityLike): string {
  return firstNonBlank(record.materialUnit, record.unit, record.baseUnit, record.material?.unit);
}

export function buildMaterialIdentitySublabel(
  record: MaterialIdentityLike,
  unitLabelMap: UnitLabelMap = {},
): string {
  const code = getMaterialCode(record);
  const spec = getMaterialSpec(record);
  const unit = formatUnitLabel(getMaterialUnit(record), unitLabelMap);
  return [code, spec ? `规格:${spec}` : '', unit ? `单位:${unit}` : ''].filter(Boolean).join(' / ');
}
