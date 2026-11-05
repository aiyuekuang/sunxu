import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto.d.ts';
export type RealtimeWorkOrdersDto = {
    completed: number;
    /**
     * 交期截止日已过的工单数
     */
    overdue: number;
    paused: number;
    pending: number;
    running: number;
    /**
     * 今日完工产量；多计量单位时为 null
     */
    todayOutput: number | null;
    todayOutputByUnit: Array<ReportQuantityUnitValueDto>;
};
