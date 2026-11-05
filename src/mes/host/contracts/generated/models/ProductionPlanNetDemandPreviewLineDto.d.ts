export type ProductionPlanNetDemandPreviewLineDto = {
    /**
     * 当前可用库存
     */
    availableQty: number;
    /**
     * 毛需求数量
     */
    grossDemandQty: number;
    /**
     * 层级；产出物料为0
     */
    level: number;
    /**
     * 物料档案编码
     */
    materialCode: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 库存抵扣后的需求净量；不含补量率和投产取整
     */
    netProductionQty: number;
    /**
     * 安全库存
     */
    safetyStock: number;
    /**
     * 供应来源
     */
    source: ProductionPlanNetDemandPreviewLineDto.source;
    /**
     * 本次建议库存抵扣数量
     */
    stockOffsetQty: number;
    /**
     * 单位
     */
    unit: string;
};
export declare namespace ProductionPlanNetDemandPreviewLineDto {
    /**
     * 供应来源
     */
    enum source {
        STOCK = "stock",
        PRODUCTION = "production",
        STOCK_AND_PRODUCTION = "stock_and_production"
    }
}
