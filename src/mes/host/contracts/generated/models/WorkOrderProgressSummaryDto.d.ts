import type { WorkOrderProgressNodeDto } from './WorkOrderProgressNodeDto.d.ts';
export type WorkOrderProgressSummaryDto = {
    /**
     * 多工序按瓶颈工序计算的可交付良品数量
     */
    bottleneckCompletedQty: number;
    /**
     * 已完成或已跳过工序数
     */
    completedOperationCount: number;
    /**
     * 当前正在执行或下一道工序ID
     */
    currentOperationIds: Array<string>;
    /**
     * 工序进度节点摘要
     */
    nodes: Array<WorkOrderProgressNodeDto>;
    /**
     * 工序总数
     */
    operationCount: number;
    /**
     * 工单总体进度百分比
     */
    overallPercent: number;
};
