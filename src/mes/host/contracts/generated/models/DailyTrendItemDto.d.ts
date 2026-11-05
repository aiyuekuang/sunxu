import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto.d.ts';
export type DailyTrendItemDto = {
    completedCount: number;
    date: string;
    /**
     * 多计量单位时为 null
     */
    qty: number | null;
    unitBreakdown: Array<ReportQuantityUnitValueDto>;
};
