/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderPlanOverrunResolution } from './WorkOrderPlanOverrunResolution';
import type { WorkOrderQuantityActionStatus } from './WorkOrderQuantityActionStatus';
import type { WorkOrderQuantityActionType } from './WorkOrderQuantityActionType';
export type WorkOrderQuantityAction = {
    /**
     * 数量动作单号
     */
    actionNo: string;
    /**
     * 数量动作类型
     */
    actionType: WorkOrderQuantityActionType;
    /**
     * 本动作是否命中审批配置
     */
    approvalRequired: boolean;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 本次增加或调整数量
     */
    deltaQty: number;
    /**
     * 动作执行时间
     */
    executedAt?: string | null;
    /**
     * 动作执行人
     */
    executedBy?: string | null;
    executor?: User | null;
    id: string;
    /**
     * 动作前工单投产数量
     */
    originalPlannedQty: number;
    /**
     * 超过生产计划的数量
     */
    planOverrunQty?: number | null;
    /**
     * 超过生产计划时选择的处理方式
     */
    planOverrunResolution?: WorkOrderPlanOverrunResolution | null;
    /**
     * 数量动作原因
     */
    reason: string;
    /**
     * 数量动作状态
     */
    status: WorkOrderQuantityActionStatus;
    supplementWorkOrder?: WorkOrder | null;
    /**
     * 补产后生成的工单ID
     */
    supplementWorkOrderId?: string | null;
    /**
     * 动作目标投产数量
     */
    targetPlannedQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder;
    /**
     * 原工单ID
     */
    workOrderId: string;
};
