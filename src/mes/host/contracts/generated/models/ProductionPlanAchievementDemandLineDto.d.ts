/**
 * 计划达成率 - 来源需求行达成
 */
export type ProductionPlanAchievementDemandLineDto = {
    demandLineId: string;
    lineNo: number;
    sourceType: string;
    sourceOrderNo: string | null;
    customerName: string | null;
    materialId: string;
    /**
     * 该需求行生产良品需求
     */
    requiredQty: number;
    /**
     * 已满足良品数量
     */
    fulfilledQty: number;
    /**
     * 需求行完成率（0-100）
     */
    completionRate: number;
    status: string;
};
