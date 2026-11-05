/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleOrderConvertInfoItemDto = {
    /**
     * 订单行 BOM 成本快照
     */
    bomCostSnapshot?: Record<string, any> | null;
    /**
     * 转生产 BOM 来源：document_bom 表示使用订单行本单 BOM，standard_bom 表示使用标准 BOM
     */
    bomSourceType?: SaleOrderConvertInfoItemDto.bomSourceType | null;
    /**
     * BOM 与工艺路线一致性说明
     */
    compatibilityMessage?: string | null;
    /**
     * BOM 与工艺路线一致性状态
     */
    compatibilityStatus?: string;
    /**
     * 兼容别名：已转数量
     */
    convertedQty: number;
    /**
     * 已占用需求数量
     */
    convertedRequiredQty: number;
    /**
     * 当前可用库存
     */
    currentStockQty: number;
    /**
     * 是否需要用户确认库存抵扣决策
     */
    decisionRequired: boolean;
    /**
     * 系统推荐 BOM ID
     */
    defaultBomHeaderId?: string | null;
    /**
     * 系统推荐 BOM 展示名
     */
    defaultBomLabel?: string | null;
    /**
     * BOM 匹配说明
     */
    defaultBomMessage?: string | null;
    /**
     * BOM 匹配状态
     */
    defaultBomStatus?: string;
    /**
     * 默认补量率
     */
    defaultLossRate: number;
    /**
     * 系统推荐工艺路线ID
     */
    defaultRouteId?: string | null;
    /**
     * 系统推荐工艺路线展示名
     */
    defaultRouteLabel?: string | null;
    /**
     * 系统推荐路线主数据ID
     */
    defaultRouteMasterId?: string | null;
    /**
     * 工艺路线匹配说明
     */
    defaultRouteMessage?: string | null;
    /**
     * 工艺路线匹配状态
     */
    defaultRouteStatus?: string;
    /**
     * 系统推荐路线版本ID
     */
    defaultRouteVersionId?: string | null;
    /**
     * 系统推荐路线版本展示名
     */
    defaultRouteVersionLabel?: string | null;
    /**
     * 净已发货数量（已确认出库数量减已完成退货）
     */
    deliveredQty: number;
    /**
     * 交货日期（明细交货日期优先，回退订单头交货日期），用于按交货日期排序投产
     */
    deliveryDate?: string | null;
    /**
     * 订单行当前本单 BOM ID；存在且已确认/冻结时作为转生产生产依据
     */
    documentBomId?: string | null;
    /**
     * 订单行当前本单 BOM 状态
     */
    documentBomStatus?: SaleOrderConvertInfoItemDto.documentBomStatus | null;
    /**
     * 订单明细行已关联图纸数
     */
    drawingCount: number;
    /**
     * 原始毛需求数量
     */
    grossDemandQty: number;
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
     * 物料档案单位
     */
    materialUnit: string;
    /**
     * 销售需求数量
     */
    orderQty: number;
    /**
     * 兼容别名：剩余数量
     */
    remainingQty: number;
    /**
     * 剩余可转需求数量
     */
    remainingRequiredQty: number;
    /**
     * 安全库存
     */
    safetyStockQty: number;
    /**
     * 销售订单明细行ID
     */
    saleOrderItemId: string;
    /**
     * 销售订单明细行序号
     */
    saleOrderItemLineNo: number;
    /**
     * 订单行确认使用的 BOM ID
     */
    selectedBomHeaderId?: string | null;
    /**
     * 供应来源
     */
    source: SaleOrderConvertInfoItemDto.source;
    /**
     * 建议库存抵扣数量
     */
    stockOffsetQty: number;
    /**
     * 建议投产数量
     */
    suggestedPlannedQty: number;
    /**
     * 建议生产数量
     */
    suggestedProductionQty: number;
    /**
     * 生产配置提醒
     */
    warnings?: Array<string>;
};
export namespace SaleOrderConvertInfoItemDto {
    /**
     * 转生产 BOM 来源：document_bom 表示使用订单行本单 BOM，standard_bom 表示使用标准 BOM
     */
    export enum bomSourceType {
        DOCUMENT_BOM = 'document_bom',
        STANDARD_BOM = 'standard_bom',
    }
    /**
     * 订单行当前本单 BOM 状态
     */
    export enum documentBomStatus {
        DRAFT = 'draft',
        CONFIRMED = 'confirmed',
        FROZEN = 'frozen',
        CHANGED = 'changed',
        OBSOLETE = 'obsolete',
    }
    /**
     * 供应来源
     */
    export enum source {
        STOCK = 'stock',
        PRODUCTION = 'production',
        STOCK_AND_PRODUCTION = 'stock_and_production',
    }
}
