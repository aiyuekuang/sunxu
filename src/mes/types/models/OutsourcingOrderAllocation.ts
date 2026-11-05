/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OutsourcingOrder } from './OutsourcingOrder';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type OutsourcingOrderAllocation = {
    /**
     * 分配给该工序的委外计划数量
     */
    allocatedQty: number;
    companyId: string;
    createdAt: string;
    id: string;
    order: OutsourcingOrder;
    /**
     * 所属委外加工单ID
     */
    orderId: string;
    /**
     * 创建合单时冻结的计划回货日；FIFO 日期为空时排在有日期的来源之后
     */
    plannedReturnDate?: string | null;
    /**
     * 已处理过的产出数量；供应商退回/返修时仍视为已消耗投入料
     */
    processedQty: number;
    /**
     * 按计划回货日 FIFO 分配给该工序的累计有效回货数量
     */
    reportedQty: number;
    updatedAt: string;
    /**
     * 来源工单
     */
    workOrder?: WorkOrder;
    /**
     * 来源工单ID
     */
    workOrderId: string;
    /**
     * 来源工单工序
     */
    workOrderOperation?: WorkOrderOperation;
    /**
     * 来源工单工序ID
     */
    workOrderOperationId: string;
};
