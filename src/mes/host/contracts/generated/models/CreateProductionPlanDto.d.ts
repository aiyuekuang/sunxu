export type CreateProductionPlanDto = {
    /**
     * 来源订单/报价 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any>;
    /**
     * BOM版本ID
     */
    bomHeaderId?: string;
    /**
     * 非标参数快照，如尺寸、工艺要求、客户要求等
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
     * 计划级图纸附件URL快照
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
     * 计划完成日期 YYYY-MM-DD；不填则由排程自动计算
     */
    planEndDate?: string;
    /**
     * 计划开始日期 YYYY-MM-DD；不填则由排程自动计算
     */
    planStartDate?: string;
    /**
     * 计划补量率
     */
    plannedLossRate?: number;
    /**
     * 投产数量
     */
    plannedQty?: number;
    /**
     * 优先级 1-10
     */
    priority?: number;
    /**
     * 需求良品数量
     */
    requiredQty?: number;
    /**
     * 工艺路线ID
     */
    routeId?: string;
    /**
     * 关联销售订单ID
     */
    saleOrderId?: string;
    /**
     * 关联销售订单明细ID
     */
    saleOrderItemId?: string;
    /**
     * 原始来源需求数量；用于追溯库存抵扣前的需求
     */
    sourceDemandQty?: number;
    /**
     * 来源需求类型
     */
    sourceDemandType?: CreateProductionPlanDto.sourceDemandType;
    /**
     * 来源订单号
     */
    sourceOrderNo?: string;
    /**
     * 计划库存抵扣决策模式
     */
    stockNettingMode?: CreateProductionPlanDto.stockNettingMode;
    /**
     * 手工指定计划净需求原因
     */
    stockNettingReason?: string;
    /**
     * 创建计划时的净需求预览快照
     */
    stockNettingSnapshot?: Record<string, any>;
    /**
     * 本计划接受库存抵扣的数量；仅用于计划审计，不代表库存已预留
     */
    stockOffsetQty?: number;
};
export declare namespace CreateProductionPlanDto {
    /**
     * 来源需求类型
     */
    enum sourceDemandType {
        SALES_ORDER = "sales_order",
        DIRECT_PLAN = "direct_plan",
        STOCK_REPLENISHMENT = "stock_replenishment",
        TRIAL = "trial",
        REWORK = "rework",
        MRP = "mrp"
    }
    /**
     * 计划库存抵扣决策模式
     */
    enum stockNettingMode {
        NONE = "none",
        ACCEPTED = "accepted",
        MANUAL_OVERRIDE = "manual_override"
    }
}
