import type { WorkOrderRiskLevel } from './WorkOrderRiskLevel.d.ts';
import type { WorkOrderRiskTag } from './WorkOrderRiskTag.d.ts';
export type WorkOrderRiskSummaryDto = {
    /**
     * 距离交期当日结束的分钟数
     */
    dueInMinutes?: number;
    /**
     * 工单风险等级
     */
    level: WorkOrderRiskLevel;
    /**
     * 超过交期截止时刻的分钟数
     */
    overdueMinutes?: number;
    /**
     * 工单风险标签
     */
    tags: Array<WorkOrderRiskTag>;
};
