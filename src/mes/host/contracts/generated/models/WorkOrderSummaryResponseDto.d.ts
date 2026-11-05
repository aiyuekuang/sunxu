import type { WorkOrderStatusSummaryDto } from './WorkOrderStatusSummaryDto.d.ts';
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
