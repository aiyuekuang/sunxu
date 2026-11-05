/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReportQuantityUnitValueDto } from './ReportQuantityUnitValueDto';
export type ProductionTrendItemDto = {
    count: number;
    label: string;
    /**
     * 仅单一计量单位时返回；多单位时为 null
     */
    qty: number | null;
    /**
     * 按计量单位拆分的产量
     */
    unitBreakdown: Array<ReportQuantityUnitValueDto>;
};
