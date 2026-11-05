import type { OrderOperationProgressDto } from './OrderOperationProgressDto.d.ts';
export type OrderProgressItemDto = {
    /**
     * 多工序按瓶颈工序计算的可交付良品数量
     */
    bottleneckCompletedQty: number;
    completedQty: number;
    customerName?: string;
    /**
     * 客户简称；未维护时为空
     */
    customerShortName?: string | null;
    id: string;
    /**
     * 兼容字段；计划完工时刻超时时为 true，请改用 planEndOverdue
     */
    isOverdue: boolean;
    materialName?: string;
    operations: Array<OrderOperationProgressDto>;
    orderNo: string;
    /**
     * 计划完工时刻是否已超时
     */
    planEndOverdue: boolean;
    planEndTime?: string | null;
    plannedQty: number;
    priority: number;
    progress: number;
    reportedQty: number;
    scrappedQty: number;
    status: string;
};
