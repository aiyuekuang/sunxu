type MaterialBatchRequirementSource = {
  hasBatchTracking?: boolean | null;
  shelfLifeDays?: number | string | null;
  family?: { defaultShelfLifeDays?: number | string | null } | null;
};

export function getEffectiveMaterialShelfLifeDays(
  material?: MaterialBatchRequirementSource | null,
): number {
  const shelfLifeDays = Number(
    material?.shelfLifeDays ?? material?.family?.defaultShelfLifeDays ?? 0,
  );
  return Number.isFinite(shelfLifeDays) && shelfLifeDays > 0 ? shelfLifeDays : 0;
}

export function requiresMaterialBatchNo(material?: MaterialBatchRequirementSource | null): boolean {
  return Boolean(material?.hasBatchTracking) || getEffectiveMaterialShelfLifeDays(material) > 0;
}
