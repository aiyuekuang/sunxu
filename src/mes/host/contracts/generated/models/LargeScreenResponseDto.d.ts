import type { CapacityWorkCenterDto } from './CapacityWorkCenterDto.d.ts';
import type { DailyTrendItemDto } from './DailyTrendItemDto.d.ts';
import type { DefectTrendItemDto } from './DefectTrendItemDto.d.ts';
import type { NameQtyItemDto } from './NameQtyItemDto.d.ts';
import type { OrderProgressItemDto } from './OrderProgressItemDto.d.ts';
import type { PeriodPerformanceMetricsDto } from './PeriodPerformanceMetricsDto.d.ts';
import type { RealtimeReportItemDto } from './RealtimeReportItemDto.d.ts';
import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto.d.ts';
import type { TaskProgressItemDto } from './TaskProgressItemDto.d.ts';
import type { WorkCenterProductivityItemDto } from './WorkCenterProductivityItemDto.d.ts';
import type { WorkOrderSummaryResponseDto } from './WorkOrderSummaryResponseDto.d.ts';
export type LargeScreenResponseDto = {
    /**
     * 当前生产流转中的工单状态，不包含已完成、已关闭和已取消历史工单
     */
    currentWorkOrderSummary: WorkOrderSummaryResponseDto;
    dailyReportTrend: Array<DailyTrendItemDto>;
    defectDistribution: Array<NameQtyItemDto>;
    defectTrend: Array<DefectTrendItemDto>;
    inProgressOrders: number;
    orderProgress: Array<OrderProgressItemDto>;
    /**
     * 交期截止日已过的工单数
     */
    overdueOrders: number;
    /**
     * 计划完工时刻已超时的工序任务数
     */
    overdueWorkerTasks: number;
    pendingOrders: number;
    /**
     * 本年期间经营指标；按期交付率只判定已到期工单，与报表看板共用同一实现
     */
    periodPerformance: PeriodPerformanceMetricsDto;
    prevCompletedOrders: number;
    prevDefectRate: number;
    prevInProgressOrders: number;
    /**
     * 多计量单位时为 null
     */
    prevOutputQty: number | null;
    prevOverdueOrders: number;
    prevReportCount: number;
    prevReportWorkerCount: number;
    prevTotalHours: number;
    previousOutputByUnit: Array<ReportQuantityUnitValueDto>;
    realtimeReports: Array<RealtimeReportItemDto>;
    sevenDayDueOrders: number;
    taskProgress: Array<TaskProgressItemDto>;
    todayCompletedOrders: number;
    todayDefectQty: number;
    todayDefectRate: number;
    todayIssueCount: number;
    todayOutputByUnit: Array<ReportQuantityUnitValueDto>;
    /**
     * 多计量单位时为 null
     */
    todayOutputQty: number | null;
    todayReportCount: number;
    todayReportWorkerCount: number;
    todayReturnCount: number;
    todayScrappedQty: number;
    todayTotalHours: number;
    /**
     * 未来 7 天的工作中心按日排产负荷，包含今天
     */
    workCenterCapacity: Array<CapacityWorkCenterDto>;
    /**
     * 近 7 天的工作中心执行情况，按瓶颈优先排序
     */
    workCenterProductivity: Array<WorkCenterProductivityItemDto>;
    workerRanking: Array<NameQtyItemDto>;
};
