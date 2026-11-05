import type { CompletedWorkOrderTrendItemDto } from './CompletedWorkOrderTrendItemDto.d.ts';
import type { DashboardPeriodPerformanceDto } from './DashboardPeriodPerformanceDto.d.ts';
import type { DashboardWorkCenterOverviewDto } from './DashboardWorkCenterOverviewDto.d.ts';
import type { DashboardWorkOrderStatusDto } from './DashboardWorkOrderStatusDto.d.ts';
import type { OrderProgressItemDto } from './OrderProgressItemDto.d.ts';
export type DashboardCockpitResponseDto = {
    completedWorkOrderTrend: Array<CompletedWorkOrderTrendItemDto>;
    periodPerformance: DashboardPeriodPerformanceDto;
    /**
     * 当前交付风险和低进度工单；历史周期为空
     */
    priorityOrders: Array<OrderProgressItemDto>;
    workCenters: DashboardWorkCenterOverviewDto;
    workOrderStatus: DashboardWorkOrderStatusDto;
};
