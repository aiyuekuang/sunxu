export type UpdateWorkOrderDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string;
    /**
     * 来源订单/报价 BOM 成本快照，仅草稿状态可修改
     */
    bomCostSnapshot?: Record<string, any>;
    /**
     * 使用的BOM版本ID
     */
    bomHeaderId?: string | null;
    /**
     * 非标参数执行快照，仅草稿状态可修改
     */
    customSnapshot?: Record<string, any>;
    /**
     * 关联客户ID
     */
    customerId?: string;
    /**
     * 备注
     */
    description?: string;
    /**
     * 工单执行图纸附件URL快照，仅草稿状态可修改
     */
    drawingUrls?: Array<string>;
    /**
     * 交货期限
     */
    dueDate?: string;
    /**
     * 工单ID
     */
    id: string;
    /**
     * 物料档案ID
     */
    materialId?: string;
    /**
     * 计划完成时间
     */
    planEndTime?: string;
    /**
     * 关联生产计划ID
     */
    planId?: string;
    /**
     * 计划开始时间
     */
    planStartTime?: string;
    plannedQty?: number;
    /**
     * 优先级 (1-10)
     */
    priority?: number;
    /**
     * 完工入库仓库ID，只有草稿状态可修改
     */
    receiptWarehouseId?: string | null;
    /**
     * 使用的工艺路线ID
     */
    routeId?: string | null;
};
