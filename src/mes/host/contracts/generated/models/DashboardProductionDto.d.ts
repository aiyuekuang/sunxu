import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto.d.ts';
export type DashboardProductionDto = {
    completionRate: number;
    /**
     * 今日完工产量；多计量单位时为 null
     */
    todayQty: number | null;
    unitBreakdown: Array<ReportQuantityUnitValueDto>;
};
