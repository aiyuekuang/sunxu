export type CreateWorkOrderDto = {
    /**
     * 负责人用户ID
     */
    assigneeId?: string;
    /**
     * 来源订单/报价 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any>;
    /**
     * 使用的BOM版本ID
     */
    bomHeaderId?: string | null;
    /**
     * 非标参数执行快照，如尺寸、工艺要求、客户要求等
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
     * 工单执行图纸附件URL快照
     */
    drawingUrls?: Array<string>;
    /**
     * 交货期限
     */
    dueDate?: string;
    /**
     * 产出物料档案ID
     */
    materialId: string;
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
    /**
     * 计划数量
     */
    plannedQty: number;
    /**
     * 完工入库仓库ID，不传则在下达时从物料默认仓库解析
     */
    receiptWarehouseId?: string | null;
    /**
     * 使用的工艺路线ID
     */
    routeId?: string | null;
};
