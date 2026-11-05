/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductionQuantityUnitMetricsDto } from './ProductionQuantityUnitMetricsDto';
export type ProductionOutputMetricsDto = {
    /**
     * 计划达成率；期间新建工单计划数量为 0 时为 null
     */
    achievementRate: number | null;
    /**
     * 所选期间新建工单（不含已取消）的已完成数量合计
     */
    completedQty: number | null;
    /**
     * 按实际完工时间归属所选期间的完工工单数
     */
    completedWorkOrders: number;
    /**
     * 按实际完工时间归属所选期间的完工产量；多单位时为 null
     */
    outputQty: number | null;
    /**
     * 所选期间新建工单（不含已取消）的计划数量合计
     */
    plannedQty: number | null;
    /**
     * 报工不良率；所选期间没有有效报工数量时为 null
     */
    reportDefectRate?: number | null;
    /**
     * 所选期间有效报工不良数量；多计量单位时为 null
     */
    reportedDefectQty: number | null;
    /**
     * 所选期间有效报工良品数量；多计量单位时为 null
     */
    reportedGoodQty: number | null;
    /**
     * 按物料基础单位拆分的产出、计划达成和报工质量指标
     */
    unitBreakdown: Array<ProductionQuantityUnitMetricsDto>;
};
