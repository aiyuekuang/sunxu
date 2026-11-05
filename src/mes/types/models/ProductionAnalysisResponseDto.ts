/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompletedWorkOrderTrendItemDto } from './CompletedWorkOrderTrendItemDto';
import type { ProductionDeliveryMetricsDto } from './ProductionDeliveryMetricsDto';
import type { ProductionOutputMetricsDto } from './ProductionOutputMetricsDto';
import type { ProductionTrendItemDto } from './ProductionTrendItemDto';
import type { ProductionWorkCenterExecutionDto } from './ProductionWorkCenterExecutionDto';
import type { ReportQueryContextResponseDto } from './ReportQueryContextResponseDto';
import type { ReportSnapshotMetaDto } from './ReportSnapshotMetaDto';
export type ProductionAnalysisResponseDto = {
    /**
     * 按实际完工时间归属的期间完工工单趋势
     */
    completedWorkOrderTrend: Array<CompletedWorkOrderTrendItemDto>;
    context: ReportQueryContextResponseDto;
    delivery: ProductionDeliveryMetricsDto;
    meta: ReportSnapshotMetaDto;
    output: ProductionOutputMetricsDto;
    /**
     * 按完工时间归属的期间产量趋势
     */
    trend: Array<ProductionTrendItemDto>;
    workCenters: ProductionWorkCenterExecutionDto;
};
