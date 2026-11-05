/**
 * 计划达成率 - 批次达成
 */
export type ProductionPlanAchievementReleaseLineDto = {
    releaseLineId: string;
    lineNo: number;
    releaseNo: string;
    /**
     * 本批投产数量
     */
    plannedQty: number;
    /**
     * 本批良品需求
     */
    requiredQty: number;
    workOrderId: string | null;
    status: string;
    /**
     * 本批已完成良品数量
     */
    completedGoodQty: number;
    /**
     * 批次完成率（0-100）
     */
    completionRate: number;
};
