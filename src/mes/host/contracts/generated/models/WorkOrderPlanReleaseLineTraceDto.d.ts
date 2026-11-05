import type { ProductionPlanReleaseLineStatus } from './ProductionPlanReleaseLineStatus.d.ts';
export type WorkOrderPlanReleaseLineTraceDto = {
    /**
     * 负责人ID
     */
    assigneeId?: string | null;
    /**
     * 批次交期
     */
    dueDate?: string | null;
    /**
     * 设备ID
     */
    equipmentId?: string | null;
    /**
     * 批次行号
     */
    lineNo: number;
    /**
     * 计划结束
     */
    planEndTime?: string | null;
    /**
     * 计划开始
     */
    planStartTime?: string | null;
    /**
     * 批次投产数量
     */
    plannedQty: number;
    /**
     * 产线ID
     */
    productionLineId?: string | null;
    /**
     * 计划批次ID
     */
    releaseLineId: string;
    /**
     * 下达批次号
     */
    releaseNo: string;
    /**
     * 批次良品需求数量
     */
    requiredQty: number;
    /**
     * 计划批次状态
     */
    status: ProductionPlanReleaseLineStatus;
    /**
     * 工作中心ID
     */
    workCenterId?: string | null;
};
