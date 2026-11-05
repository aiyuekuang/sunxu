export type PlanAchievementDemandLineDto = {
    /**
     * 本行达成率（0-100）
     */
    completionRate: number;
    /**
     * 客户名称
     */
    customerName?: string | null;
    /**
     * 需求行ID
     */
    demandLineId: string;
    /**
     * 本行已满足良品数量
     */
    fulfilledQty: number;
    /**
     * 计划内需求行号
     */
    lineNo: number;
    /**
     * 需求物料ID
     */
    materialId: string;
    /**
     * 本行生产良品需求
     */
    requiredQty: number;
    /**
     * 来源订单号
     */
    sourceOrderNo?: string | null;
    /**
     * 来源类型
     */
    sourceType: string;
    /**
     * 需求行状态
     */
    status: string;
};
