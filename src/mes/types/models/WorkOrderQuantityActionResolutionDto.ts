/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrderPlanOverrunResolution } from './WorkOrderPlanOverrunResolution';
export type WorkOrderQuantityActionResolutionDto = {
    /**
     * 处理方式编码
     */
    code: WorkOrderPlanOverrunResolution;
    /**
     * 处理说明
     */
    description: string;
    /**
     * 不可选原因
     */
    disabledReason?: string;
    /**
     * 当前是否可选
     */
    enabled: boolean;
    /**
     * 处理方式名称
     */
    label: string;
};
