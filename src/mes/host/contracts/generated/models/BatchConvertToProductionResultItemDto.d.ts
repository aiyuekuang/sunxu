export type BatchConvertToProductionResultItemDto = {
    /**
     * 生产计划使用的 BOM ID
     */
    bomHeaderId?: string | null;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 生产计划ID
     */
    planId: string;
    /**
     * 生产计划单号
     */
    planNo: string;
    /**
     * 计划补量率
     */
    plannedLossRate: number;
    /**
     * 投产数量
     */
    plannedQty: number;
    /**
     * 需求良品数量
     */
    requiredQty: number;
    /**
     * 生产计划使用的工艺路线ID
     */
    routeId?: string | null;
    /**
     * 销售订单明细行ID
     */
    saleOrderItemId: string;
    /**
     * 生产配置提醒
     */
    warnings?: Array<string>;
    /**
     * 自动生成的工单ID（仅当 autoCreateWorkOrder=true 且该计划建单成功时返回）
     */
    workOrderId?: string | null;
    /**
     * 自动生成的工单号（仅当 autoCreateWorkOrder=true 且该计划建单成功时返回）
     */
    workOrderNo?: string | null;
};
