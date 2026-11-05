import type { StockCountSubmitLineDto } from './StockCountSubmitLineDto.d.ts';
export type SubmitStockCountDto = {
    /**
     * ID
     */
    id: string;
    /**
     * 实盘结果
     */
    lines: Array<StockCountSubmitLineDto>;
};
