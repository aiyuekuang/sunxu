/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductionPlanNetDemandPreviewLineDto } from './ProductionPlanNetDemandPreviewLineDto';
import type { ProductionQtyRoundingMode } from './ProductionQtyRoundingMode';
export type ProductionPlanNetDemandPreviewResponseDto = {
    /**
     * 当前可用库存
     */
    currentStockQty: number;
    /**
     * 是否需要用户确认库存抵扣决策
     */
    decisionRequired: boolean;
    /**
     * 原始需求数量
     */
    grossDemandQty: number;
    /**
     * 净需求明细
     */
    lines: Array<ProductionPlanNetDemandPreviewLineDto>;
    /**
     * 物料档案编码
     */
    materialCode: string;
    /**
     * 产出物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 当前物料档案的投产数量取整方式
     */
    productionQtyRoundingMode: ProductionQtyRoundingMode;
    /**
     * 安全库存
     */
    safetyStockQty: number;
    /**
     * 来源需求类型
     */
    sourceDemandType: ProductionPlanNetDemandPreviewResponseDto.sourceDemandType | null;
    /**
     * 建议库存抵扣数量
     */
    stockOffsetQty: number;
    /**
     * 库存可用范围
     */
    stockScope: ProductionPlanNetDemandPreviewResponseDto.stockScope;
    /**
     * 库存抵扣后的需求净量；投产取整与补量率在建计划时应用
     */
    suggestedProductionQty: number;
    /**
     * 单位
     */
    unit: string;
    /**
     * 提示信息
     */
    warnings: Array<string>;
};
export namespace ProductionPlanNetDemandPreviewResponseDto {
    /**
     * 来源需求类型
     */
    export enum sourceDemandType {
        SALES_ORDER = 'sales_order',
        DIRECT_PLAN = 'direct_plan',
        STOCK_REPLENISHMENT = 'stock_replenishment',
        TRIAL = 'trial',
        REWORK = 'rework',
        MRP = 'mrp',
    }
    /**
     * 库存可用范围
     */
    export enum stockScope {
        ON_HAND = 'on_hand',
    }
}
