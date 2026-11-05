/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompletedWorkOrderTrendItemDto } from './CompletedWorkOrderTrendItemDto';
import type { DashboardPeriodPerformanceDto } from './DashboardPeriodPerformanceDto';
import type { DashboardWorkCenterOverviewDto } from './DashboardWorkCenterOverviewDto';
import type { DashboardWorkOrderStatusDto } from './DashboardWorkOrderStatusDto';
import type { OrderProgressItemDto } from './OrderProgressItemDto';
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
