/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrderPlanOverrunMode } from './WorkOrderPlanOverrunMode';
import type { WorkOrderPlanOverrunResolution } from './WorkOrderPlanOverrunResolution';
import type { WorkOrderQuantityActionResolutionDto } from './WorkOrderQuantityActionResolutionDto';
export type WorkOrderQuantityActionPlanImpactDto = {
    /**
     * 当前已分配工单投产数量
     */
    allocatedQty: number;
    availableResolutions: Array<WorkOrderQuantityActionResolutionDto>;
    /**
     * 是否可以同步调增生产计划
     */
    canAdjustPlan: boolean;
    /**
     * 是否超过配置允许的超计划容差
     */
    exceedsTolerance: boolean;
    /**
     * 是否超过生产计划或容差
     */
    overrun: boolean;
    /**
     * 命中的超计划处理策略
     */
    overrunMode: WorkOrderPlanOverrunMode;
    /**
     * 超过生产计划的数量
     */
    overrunQty: number;
    /**
     * 生产计划ID
     */
    planId?: string;
    /**
     * 生产计划号
     */
    planNo?: string;
    /**
     * 生产计划投产数量
     */
    planPlannedQty: number;
    /**
     * 建议下一步
     */
    recommendedAction: string;
    /**
     * 计划剩余可分配数量
     */
    remainingQty: number;
    /**
     * 本次选择的超计划处理方式
     */
    selectedResolution?: WorkOrderPlanOverrunResolution;
    /**
     * 本动作后的已分配投产数量
     */
    targetAllocatedQty: number;
    /**
     * 按策略允许的超计划容差数量
     */
    toleranceQty: number;
};
