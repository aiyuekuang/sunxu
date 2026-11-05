import type { WorkOrderProgressNodeStatus } from './WorkOrderProgressNodeStatus.d.ts';
export type WorkOrderProgressNodeDto = {
    /**
     * 工序良品数量
     */
    goodQty: number;
    /**
     * 工序ID
     */
    operationId: string;
    /**
     * 工序名称
     */
    operationName: string;
    /**
     * 工序进度百分比
     */
    percent: number;
    /**
     * 工序有效计划数量
     */
    plannedQty: number;
    /**
     * 工序已报数量（良品 + 报废）
     */
    reportedQty: number;
    /**
     * 工序报废数量
     */
    scrappedQty: number;
    /**
     * 工序顺序号
     */
    sequence: number;
    /**
     * 工序进度节点展示状态
     */
    status: WorkOrderProgressNodeStatus;
    /**
     * 工序节点风险标签，如 quality_blocked / dependency_blocked
     */
    warningTags: Array<string>;
    /**
     * 工作中心名称
     */
    workCenterName?: string;
};
