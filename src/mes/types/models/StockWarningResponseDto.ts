/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LowStockItemDto } from './LowStockItemDto';
import type { StockWarningSummaryDto } from './StockWarningSummaryDto';
export type StockWarningResponseDto = {
    /**
     * 当前库存预警数量；与看板库存预警统计使用同一口径
     */
    lowStockCount?: number;
    /**
     * 低库存物料列表
     */
    lowStock: Array<LowStockItemDto>;
    /**
     * 按物料和仓库合并的库存预警展示行；预警结论仍按货主分别判断
     */
    lowStockSummaries: Array<StockWarningSummaryDto>;
};
