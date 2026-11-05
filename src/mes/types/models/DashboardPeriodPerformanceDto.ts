/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductionQuantityUnitMetricsDto } from './ProductionQuantityUnitMetricsDto';
export type DashboardPeriodPerformanceDto = {
    /**
     * 按实际完工时间归属所选期间的完工工单数
     */
    completedWorkOrders: number;
    /**
     * 客户交期落在所选期间且交期日已结束的工单数
     */
    deliveryEligibleWorkOrders: number;
    /**
     * 在客户交期当日或之前实际完工的工单数
     */
    onTimeCompletedWorkOrders: number;
    /**
     * 按客户交期统计的按期率；期间无交期日已结束的工单时为 null
     */
    onTimeDeliveryRate: number | null;
    /**
     * 所选期间可交付完工产量；存在多个计量单位时为 null
     */
    outputQty: number | null;
    /**
     * 报工不良率；所选期间没有有效报工数量时为 null
     */
    reportDefectRate?: number | null;
    /**
     * 所选期间有效报工不良数量；多计量单位时为 null
     */
    reportedDefectQty?: number | null;
    /**
     * 所选期间有效报工良品数量；多计量单位时为 null
     */
    reportedGoodQty: number | null;
    /**
     * 按计量单位拆分的生产数量与比率
     */
    unitBreakdown: Array<ProductionQuantityUnitMetricsDto>;
};
