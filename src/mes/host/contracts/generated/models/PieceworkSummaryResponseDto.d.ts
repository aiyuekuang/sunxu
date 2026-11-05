import type { PieceworkGlobalSummaryDto } from './PieceworkGlobalSummaryDto.d.ts';
import type { PieceworkSummaryItemDto } from './PieceworkSummaryItemDto.d.ts';
export type PieceworkSummaryResponseDto = {
    /**
     * 汇总列表
     */
    list: Array<PieceworkSummaryItemDto>;
    /**
     * 当前页码
     */
    page: number;
    /**
     * 每页条数
     */
    pageSize: number;
    /**
     * 全局合计
     */
    summary: PieceworkGlobalSummaryDto;
    /**
     * 总条数
     */
    total: number;
};
