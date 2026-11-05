import type { Material, MaterialSupplierWithDefaultPrice } from '../host/services';
import { buildMaterialIdentitySublabel } from './material-identity';
import type { UnitLabelMap } from './qty-unit';

export interface SupplierMaterialPickerOption {
  id: string;
  material: Material;
  supplierMaterialCode: string;
  grade?: string | null;
  unitPrice: number | null;
  supplierPriceTierId?: string | null;
  taxRate?: number | null;
  priceIncludesTax?: boolean | null;
  currency?: string | null;
  label: string;
  sublabel: string;
  searchText: string;
}

interface CreateSupplierMaterialPickerOptionInput {
  optionId?: string;
  material: Material;
  supplierMaterialCode?: string | null;
  grade?: string | null;
  unitPrice?: number | null;
  supplierPriceTierId?: string | null;
  taxRate?: number | null;
  priceIncludesTax?: boolean | null;
  currency?: string | null;
  unitLabelMap?: UnitLabelMap;
}

function normalizeText(value?: string | null): string {
  return value?.trim() ?? '';
}

export function createSupplierMaterialPickerOption({
  optionId,
  material,
  supplierMaterialCode,
  grade,
  unitPrice,
  supplierPriceTierId,
  taxRate,
  priceIncludesTax,
  currency,
  unitLabelMap,
}: CreateSupplierMaterialPickerOptionInput): SupplierMaterialPickerOption {
  const normalizedSupplierMaterialCode = normalizeText(supplierMaterialCode);
  const materialSublabel = buildMaterialIdentitySublabel(material, unitLabelMap);

  return {
    id: optionId ?? supplierPriceTierId ?? material.id,
    material,
    supplierMaterialCode: normalizedSupplierMaterialCode,
    grade: grade ?? null,
    unitPrice: unitPrice ?? null,
    supplierPriceTierId: supplierPriceTierId ?? null,
    taxRate: taxRate ?? null,
    priceIncludesTax: priceIncludesTax ?? null,
    currency: currency ?? null,
    label: material.name,
    sublabel: [
      grade ? `品质等级:${grade}` : '',
      normalizedSupplierMaterialCode ? `供应商料号:${normalizedSupplierMaterialCode}` : '',
      materialSublabel,
    ]
      .filter(Boolean)
      .join(' / '),
    searchText: [
      grade ?? '',
      normalizedSupplierMaterialCode,
      material.code,
      material.name,
      material.unit,
      material.spec ?? '',
      material.spec ?? '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
}

function sortSupplierMaterialOptions(
  options: SupplierMaterialPickerOption[],
): SupplierMaterialPickerOption[] {
  return [...options].sort((a, b) => {
    const materialCompare = a.material.name.localeCompare(b.material.name);
    if (materialCompare !== 0) return materialCompare;
    return (a.grade ?? '').localeCompare(b.grade ?? '');
  });
}

function isEffectivePriceTier(
  tier: NonNullable<MaterialSupplierWithDefaultPrice['activePriceTiers']>[number],
  asOfDate?: string,
): boolean {
  if (!asOfDate) return true;
  return tier.validFrom <= asOfDate && (!tier.validTo || tier.validTo >= asOfDate);
}

function buildOptionsFromRecord(
  record: MaterialSupplierWithDefaultPrice,
  asOfDate?: string,
  unitLabelMap?: UnitLabelMap,
): SupplierMaterialPickerOption[] {
  if (!record.material) {
    return [];
  }

  const activePriceTiers = (record.activePriceTiers ?? []).filter((tier) =>
    isEffectivePriceTier(tier, asOfDate),
  );
  if (activePriceTiers.length > 0) {
    return activePriceTiers.map((tier) =>
      createSupplierMaterialPickerOption({
        optionId: `${record.material.id}:${tier.id}`,
        material: record.material,
        supplierMaterialCode: tier.supplierMaterialCode ?? record.supplierMaterialCode,
        grade: tier.grade,
        unitPrice: tier.unitPrice,
        supplierPriceTierId: tier.id,
        taxRate: tier.taxRate,
        priceIncludesTax: tier.priceIncludesTax,
        currency: tier.currency,
        unitLabelMap,
      }),
    );
  }

  return [
    createSupplierMaterialPickerOption({
      material: record.material,
      supplierMaterialCode: record.supplierMaterialCode,
      unitPrice: record.defaultPurchasePrice,
      supplierPriceTierId: record.defaultPurchasePriceTierId,
      taxRate: record.defaultPurchaseTaxRate,
      priceIncludesTax: record.defaultPurchasePriceIncludesTax,
      currency: record.defaultPurchaseCurrency,
      unitLabelMap,
    }),
  ];
}

function resolveSupplierMaterialOptions(
  records: MaterialSupplierWithDefaultPrice[],
  asOfDate?: string,
  unitLabelMap?: UnitLabelMap,
): SupplierMaterialPickerOption[] {
  if (!asOfDate) {
    return sortSupplierMaterialOptions(
      records.flatMap((record) => buildOptionsFromRecord(record, undefined, unitLabelMap)),
    );
  }

  return sortSupplierMaterialOptions(
    records
      .filter((record) => !record.validFrom || record.validFrom <= asOfDate)
      .flatMap((record) => buildOptionsFromRecord(record, asOfDate, unitLabelMap)),
  );
}

export function buildSupplierMaterialPickerOptions(
  records: MaterialSupplierWithDefaultPrice[],
  asOfDate?: string,
  unitLabelMap?: UnitLabelMap,
): SupplierMaterialPickerOption[] {
  return resolveSupplierMaterialOptions(records, asOfDate, unitLabelMap);
}

export function findSupplierMaterialPickerOption(
  records: MaterialSupplierWithDefaultPrice[],
  materialId: string,
  asOfDate?: string,
  grade?: string | null,
  unitLabelMap?: UnitLabelMap,
): SupplierMaterialPickerOption | undefined {
  const options = resolveSupplierMaterialOptions(records, asOfDate, unitLabelMap);
  const normalizedGrade = grade ?? null;
  return (
    options.find(
      (option) => option.material.id === materialId && option.grade === normalizedGrade,
    ) ?? options.find((option) => option.material.id === materialId)
  );
}

export function paginateSupplierMaterialPickerOptions(
  options: SupplierMaterialPickerOption[],
  params: { page: number; pageSize: number; keyword?: string },
): { list: SupplierMaterialPickerOption[]; total: number } {
  const keyword = params.keyword?.trim().toLowerCase() ?? '';
  const filtered = keyword
    ? options.filter((option) => option.searchText.includes(keyword))
    : options;
  const start = Math.max(0, (params.page - 1) * params.pageSize);

  return {
    list: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  };
}
