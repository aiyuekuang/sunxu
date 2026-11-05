export type CopyWorkOrderDto = {
    /**
     * 新工单关联计划ID
     */
    planId?: string;
    plannedQty?: number;
    /**
     * 源工单ID
     */
    sourceId: string;
};
