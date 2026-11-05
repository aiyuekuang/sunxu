import type { TopDefectItemDto } from './TopDefectItemDto.d.ts';
export type QualitySummaryResponseDto = {
    failCount: number;
    passCount: number;
    passRate: number;
    /**
     * 待检/检验中/审批中的质检单数量
     */
    pendingCount: number;
    topDefects: Array<TopDefectItemDto>;
    totalCount: number;
    totalFail: number;
    totalPass: number;
    totalSample: number;
};
