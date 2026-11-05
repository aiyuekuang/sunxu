/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrderQuantityActionApprovalDto } from './WorkOrderQuantityActionApprovalDto';
import type { WorkOrderQuantityActionFactsDto } from './WorkOrderQuantityActionFactsDto';
import type { WorkOrderQuantityActionPlanImpactDto } from './WorkOrderQuantityActionPlanImpactDto';
import type { WorkOrderQuantityActionType } from './WorkOrderQuantityActionType';
import type { WorkOrderStatus } from './WorkOrderStatus';
export type WorkOrderQuantityActionPreviewResponseDto = {
    actionType: WorkOrderQuantityActionType;
    approval: WorkOrderQuantityActionApprovalDto;
    /**
     * 阻断原因
     */
    blockingReasons: Array<string>;
    /**
     * 预检是否允许继续提交
     */
    canExecute: boolean;
    /**
     * 本次增加或调整数量
     */
    deltaQty: number;
    facts: WorkOrderQuantityActionFactsDto;
    /**
     * 动作完成后的后续建议
     */
    nextSteps: Array<string>;
    /**
     * 工单号
     */
    orderNo: string;
    /**
     * 动作前投产数量
     */
    originalPlannedQty: number;
    /**
     * 关联生产计划的数量影响
     */
    planImpact?: WorkOrderQuantityActionPlanImpactDto | null;
    /**
     * 提交前必须填写的字段
     */
    requiredInputs: Array<string>;
    /**
     * 因未配置增强模块而跳过的非阻断处理
     */
    skippedBecauseDisabled: Array<string>;
    status: WorkOrderStatus;
    /**
     * 动作后目标投产数量
     */
    targetPlannedQty: number;
    /**
     * 非阻断风险提示
     */
    warnings: Array<string>;
    /**
     * 确认后会实际执行的处理
     */
    willApply: Array<string>;
    /**
     * 工单ID
     */
    workOrderId: string;
};
