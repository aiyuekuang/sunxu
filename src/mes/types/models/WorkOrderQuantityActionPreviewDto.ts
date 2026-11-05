/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkOrderQuantityActionPreviewDto = {
    /**
     * 数量动作类型：edit=改数量，append=追加，supplement=补产
     */
    actionType?: WorkOrderQuantityActionPreviewDto.actionType;
    /**
     * 追加或补产数量。追加/补产时传入。
     */
    deltaQty?: number;
    /**
     * 工单ID
     */
    id: string;
    /**
     * 超过生产计划时选择的处理方式
     */
    planOverrunResolution?: WorkOrderQuantityActionPreviewDto.planOverrunResolution;
    /**
     * 动作原因
     */
    reason?: string;
    /**
     * 目标投产数量。改数量时传入；追加/补产可不传。
     */
    targetPlannedQty?: number;
};
export namespace WorkOrderQuantityActionPreviewDto {
    /**
     * 数量动作类型：edit=改数量，append=追加，supplement=补产
     */
    export enum actionType {
        EDIT = 'edit',
        APPEND = 'append',
        SUPPLEMENT = 'supplement',
    }
    /**
     * 超过生产计划时选择的处理方式
     */
    export enum planOverrunResolution {
        ACCEPT_WARNING = 'accept_warning',
        SUBMIT_OVERRUN_APPROVAL = 'submit_overrun_approval',
        ADJUST_PLAN_AND_APPEND = 'adjust_plan_and_append',
    }
}
