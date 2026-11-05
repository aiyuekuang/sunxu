import { MaterialType } from '../../host/api-types';
import { WarehouseTypeFamily } from '../../host/api-types';
import { WAREHOUSE_TYPE_CONFIG } from '../../constants/status-configs';

const DEFAULT_PRIMARY_RECEIPT_WAREHOUSE_FAMILY = WarehouseTypeFamily.FINISHED_GOODS;
const SYSTEM_MATERIAL_BASE_TYPES = [MaterialType.RAW, MaterialType.SEMI, MaterialType.FINISHED];

type MaterialBaseTypeCarrier = {
  baseType?: string | null;
  type?: string | null;
};

const MATERIAL_TYPE_PRIMARY_RECEIPT_WAREHOUSE_FAMILY: Record<string, WarehouseTypeFamily> = {
  raw: WarehouseTypeFamily.RAW_MATERIAL,
  semi: WarehouseTypeFamily.WIP,
  finished: WarehouseTypeFamily.FINISHED_GOODS,
};

function normalizeMaterialType(materialType?: string | null): string {
  return materialType?.trim().toLowerCase() ?? '';
}

export function resolveMaterialBaseType(
  material?: MaterialBaseTypeCarrier | null,
): MaterialType | undefined {
  const candidate = normalizeMaterialType(material?.baseType ?? material?.type);
  return SYSTEM_MATERIAL_BASE_TYPES.includes(candidate as MaterialType)
    ? (candidate as MaterialType)
    : undefined;
}

function getPrimaryReceiptWarehouseFamilyByMaterialType(
  materialType?: string | null,
): WarehouseTypeFamily {
  const normalized = normalizeMaterialType(materialType);
  return (
    MATERIAL_TYPE_PRIMARY_RECEIPT_WAREHOUSE_FAMILY[normalized] ??
    DEFAULT_PRIMARY_RECEIPT_WAREHOUSE_FAMILY
  );
}

export function getReceiptWarehouseFamiliesByMaterialType(
  materialType?: string | null,
): WarehouseTypeFamily[] {
  const families: WarehouseTypeFamily[] = [
    getPrimaryReceiptWarehouseFamilyByMaterialType(materialType),
  ];
  families.push(WarehouseTypeFamily.GENERAL);
  return [...new Set(families)];
}

export function getIssueWarehouseFamiliesByMaterialType(
  materialType?: string | null,
): WarehouseTypeFamily[] {
  const families = getReceiptWarehouseFamiliesByMaterialType(materialType);
  if (normalizeMaterialType(materialType) === MaterialType.RAW) {
    families.push(WarehouseTypeFamily.LINE_SIDE);
  }
  return [...new Set(families)];
}

export function getReceiptWarehouseFamilyLabelByMaterialType(materialType?: string | null): string {
  const families = getReceiptWarehouseFamiliesByMaterialType(materialType);
  return families
    .map((family) =>
      family === WarehouseTypeFamily.GENERAL && families.length > 1
        ? '通用仓（兜底）'
        : (WAREHOUSE_TYPE_CONFIG[family]?.label ?? family),
    )
    .join('或');
}

export function getReceiptWarehouseHintByMaterialType(materialType?: string | null): string {
  return `可选，仅显示${getReceiptWarehouseFamilyLabelByMaterialType(materialType)}；不选则下达时使用物料默认仓库`;
}
