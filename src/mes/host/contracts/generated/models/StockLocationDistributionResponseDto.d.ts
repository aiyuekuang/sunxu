import type { StockLocationDistributionItemDto } from './StockLocationDistributionItemDto.d.ts';
export type StockLocationDistributionResponseDto = {
    /**
     * 批号
     */
    batchNo?: string | null;
    locations: Array<StockLocationDistributionItemDto>;
    /**
     * 物料档案ID
     */
    materialId?: string | null;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
