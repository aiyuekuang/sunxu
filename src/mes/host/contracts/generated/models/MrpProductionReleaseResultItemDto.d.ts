export type MrpProductionReleaseResultItemDto = {
    materialId: string;
    productionPlanId?: string | null;
    productionPlanNo?: string | null;
    releasedQty: number;
    remainingQty: number;
    requestedQty: number;
    runItemId: string;
};
