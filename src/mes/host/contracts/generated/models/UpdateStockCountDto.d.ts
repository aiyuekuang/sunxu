import type { StockCountLineInputDto } from './StockCountLineInputDto.d.ts';
export type UpdateStockCountDto = {
    /**
     * 盘点日期
     */
    countDate?: string;
    /**
     * 盘点单ID
     */
    id: string;
    /**
     * 重置盘点行；仅草稿/盘点中状态允许
     */
    lines?: Array<StockCountLineInputDto>;
    /**
     * 备注
     */
    remarks?: string;
};
