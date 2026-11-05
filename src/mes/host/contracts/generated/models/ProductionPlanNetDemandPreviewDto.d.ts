export type ProductionPlanNetDemandPreviewDto = {
    /**
     * 是否返回子装配净需求提示；P0仅提示，P1落地多层净算
     */
    includeSubAssemblies?: boolean;
    /**
     * 产出物料档案ID
     */
    materialId: string;
    /**
     * 需求日期
     */
    needDate?: string;
    /**
     * 原始需求数量
     */
    quantity: number;
    /**
     * 来源需求类型
     */
    sourceDemandType?: ProductionPlanNetDemandPreviewDto.sourceDemandType;
    /**
     * 库存可用范围；P0仅支持现存可用库存
     */
    stockScope?: ProductionPlanNetDemandPreviewDto.stockScope;
};
export declare namespace ProductionPlanNetDemandPreviewDto {
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
     * 库存可用范围；P0仅支持现存可用库存
     */
    enum stockScope {
        ON_HAND = "on_hand"
    }
}
