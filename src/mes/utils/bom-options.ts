import { BomSourceType } from '../host/api-types';
import { BomStatus } from '../host/api-types';
import { type BomHeader, bomService } from '../host/services';

export interface BomSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  sourceType?: BomSourceType;
  raw?: BomHeader;
}

export interface ProductionBomOptionRequestParams {
  page: number;
  pageSize: number;
  keyword?: string;
  materialId?: string | null;
  saleOrderId?: string | null;
  saleOrderItemId?: string | null;
}

type BomScopeCarrier = { bomScope?: unknown };

const SELECTABLE_STANDARD_BOM_SCOPES = new Set<string>(['model_standard', 'model_effective']);

const SOURCE_LABEL: Record<BomSourceType, string> = {
  [BomSourceType.STANDARD]: '标准',
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getSourceType(bom: BomHeader): BomSourceType {
  return bom.sourceType ?? BomSourceType.STANDARD;
}

function getBomScope(bom: BomHeader & BomScopeCarrier): string {
  return typeof bom.bomScope === 'string' ? bom.bomScope : 'model_standard';
}

function isSelectableBom(bom: BomHeader & BomScopeCarrier): boolean {
  if (bom.status !== BomStatus.ACTIVE) return false;
  return (
    getSourceType(bom) === BomSourceType.STANDARD &&
    SELECTABLE_STANDARD_BOM_SCOPES.has(getBomScope(bom))
  );
}

export function getBomLabel(bom: BomHeader, fallbackMaterialName?: string): string {
  const materialLabel = [readString(bom.material?.code), readString(bom.material?.name)]
    .filter(Boolean)
    .join(' - ');
  const suffix = [readString(bom.sourceSummary)].filter(Boolean);
  const masterName = readString(bom.bomMaster?.name);

  return [
    materialLabel || readString(fallbackMaterialName) || 'BOM',
    masterName,
    `版本 ${bom.version || 'V1'}`,
    suffix.length > 0 ? suffix.join(' · ') : undefined,
  ]
    .filter(Boolean)
    .join(' - ');
}

export function getBomSublabel(bom: BomHeader): string {
  const sourceType = getSourceType(bom);
  return SOURCE_LABEL[sourceType];
}

export function createBomSelectOption(
  bom: BomHeader,
  fallbackMaterialName?: string,
): BomSelectOption {
  return {
    id: bom.id,
    label: getBomLabel(bom, fallbackMaterialName),
    sublabel: getBomSublabel(bom),
    sourceType: getSourceType(bom),
    raw: bom,
  };
}

export async function requestStandardBomOptions(
  params: ProductionBomOptionRequestParams,
): Promise<{ list: BomHeader[]; total: number }> {
  const materialId = readString(params.materialId);
  if (!materialId) return { list: [], total: 0 };

  const candidates = await bomService.listSelectableForMaterial(materialId);
  const keyword = readString(params.keyword)?.toLocaleLowerCase();
  const filtered = candidates.filter((bom) => {
    if (!isSelectableBom(bom)) return false;
    if (!keyword) return true;
    return getBomLabel(bom).toLocaleLowerCase().includes(keyword);
  });
  const start = Math.max((params.page - 1) * params.pageSize, 0);

  return {
    list: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  };
}

export async function requestProductionBomOptions(
  params: ProductionBomOptionRequestParams,
): Promise<{ list: BomHeader[]; total: number }> {
  const materialId = readString(params.materialId);
  if (!materialId) return { list: [], total: 0 };
  return requestStandardBomOptions({ ...params, materialId });
}

export async function requestProductionBomSelectOptions(
  params: ProductionBomOptionRequestParams & { fallbackMaterialName?: string },
): Promise<{ list: BomSelectOption[]; total: number }> {
  const result = await requestProductionBomOptions(params);
  return {
    total: result.total,
    list: result.list.map((bom) => createBomSelectOption(bom, params.fallbackMaterialName)),
  };
}
