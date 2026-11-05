export type PeriodPerformanceMetricsDto = {
    /**
     * 客户交期落在所选期间且交期日已结束的工单数
     */
    deliveryEligibleWorkOrders: number;
    /**
     * 在客户交期当日或之前实际完工的工单数
     */
    onTimeCompletedWorkOrders: number;
    /**
     * 按客户交期统计的按期率；期间无交期日已结束的工单时为 null
     */
    onTimeDeliveryRate: number | null;
    /**
     * 报工不良率；所选期间没有有效报工数量时为 null
     */
    reportDefectRate?: number | null;
    /**
     * 所选期间有效报工不良数量；多计量单位时为 null
     */
    reportedDefectQty?: number | null;
    /**
     * 所选期间有效报工良品数量；多计量单位时为 null
     */
    reportedGoodQty: number | null;
};
