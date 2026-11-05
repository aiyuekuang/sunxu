import type { WorkOrderType } from './WorkOrderType.d.ts';
export type PlanWorkOrderItemDto = {
    /**
     * 完成数量
     */
    completedQty: number;
    /**
     * 工单ID
     */
    id: string;
    /**
     * 物料档案编码
     */
    materialCode?: string | null;
    /**
     * 物料档案名称
     */
    materialName?: string | null;
    /**
     * 规格型号
     */
    materialSpec?: string | null;
    /**
     * 父工单ID
     */
    parentWorkOrderId?: string | null;
    /**
     * 计划数量
     */
    plannedQty: number;
    /**
     * 进度百分比（0-100）
     */
    progress: number;
    /**
     * 报废数量
     */
    scrappedQty: number;
    /**
     * 状态
     */
    status: string;
    /**
     * 状态中文
     */
    statusLabel: string;
    /**
     * 库存基础单位
     */
    unit?: string | null;
    /**
     * 工单号
     */
    workOrderNo: string;
    /**
     * 工单类型
     */
    workOrderType?: WorkOrderType;
};
