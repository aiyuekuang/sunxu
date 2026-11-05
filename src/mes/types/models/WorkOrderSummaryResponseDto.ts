/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrderStatusSummaryDto } from './WorkOrderStatusSummaryDto';
export type WorkOrderSummaryResponseDto = {
    /**
     * 按状态分组的汇总，key 为状态值
     */
    byStatus: Record<string, WorkOrderStatusSummaryDto>;
    /**
     * 交期截止日已过的工单数
     */
    overdueCount: number;
    total: number;
};
