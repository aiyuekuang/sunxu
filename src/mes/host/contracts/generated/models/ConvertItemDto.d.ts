export type ConvertItemDto = {
    /**
     * 本次确认使用的 BOM 版本ID
     */
    bomHeaderId?: string;
    /**
     * 计划补量率
     */
    plannedLossRate?: number;
    /**
     * 投产数量（兼容旧字段名：转生产数量）
     */
    plannedQty?: number;
    /**
     * 需求良品数量
     */
    requiredQty?: number;
    /**
     * 本次确认使用的工艺路线ID
     */
    routeId?: string;
    /**
     * 销售订单明细行ID
     */
    saleOrderItemId: string;
    /**
     * 原始来源需求数量；用于追溯库存抵扣前的销售需求
     */
    sourceDemandQty?: number;
    /**
     * 来源需求类型
     */
    sourceDemandType?: ConvertItemDto.sourceDemandType;
    /**
     * 计划库存抵扣决策模式
     */
    stockNettingMode?: ConvertItemDto.stockNettingMode;
    /**
     * 手工指定计划净需求原因
     */
    stockNettingReason?: string;
    /**
     * 转生产时的净需求预览快照
     */
    stockNettingSnapshot?: Record<string, any>;
    /**
     * 本次接受库存抵扣的数量；仅用于计划审计，不代表库存已预留
     */
    stockOffsetQty?: number;
};
export declare namespace ConvertItemDto {
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
