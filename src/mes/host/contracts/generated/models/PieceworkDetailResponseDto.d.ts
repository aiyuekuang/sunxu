import type { PieceworkDetailItemDto } from './PieceworkDetailItemDto.d.ts';
import type { PieceworkGlobalSummaryDto } from './PieceworkGlobalSummaryDto.d.ts';
export type PieceworkDetailResponseDto = {
    /**
     * 明细列表
     */
    list: Array<PieceworkDetailItemDto>;
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
