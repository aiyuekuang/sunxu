/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderQuantityAction } from './WorkOrderQuantityAction';
import type { WorkOrderQuantityActionPreviewResponseDto } from './WorkOrderQuantityActionPreviewResponseDto';
export type WorkOrderQuantityActionResultDto = {
    /**
     * 数量动作单
     */
    action: WorkOrderQuantityAction;
    /**
     * 本次提交是否已经生效
     */
    executed: boolean;
    /**
     * 动作结果提示
     */
    message?: string;
    /**
     * 提交前的预检结果
     */
    preview?: WorkOrderQuantityActionPreviewResponseDto;
    /**
     * 补产时生成的新工单
     */
    supplementWorkOrder?: WorkOrder | null;
    /**
     * 动作后的原工单
     */
    workOrder: WorkOrder;
};
