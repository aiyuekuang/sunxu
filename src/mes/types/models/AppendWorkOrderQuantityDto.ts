/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AppendWorkOrderQuantityDto = {
    /**
     * 本次追加投产数量
     */
    deltaQty: number;
    /**
     * 工单ID
     */
    id: string;
    /**
     * 超过生产计划时选择的处理方式
     */
    planOverrunResolution?: AppendWorkOrderQuantityDto.planOverrunResolution;
    /**
     * 追加原因
     */
    reason?: string;
};
export namespace AppendWorkOrderQuantityDto {
    /**
     * 超过生产计划时选择的处理方式
     */
    export enum planOverrunResolution {
        ACCEPT_WARNING = 'accept_warning',
        SUBMIT_OVERRUN_APPROVAL = 'submit_overrun_approval',
        ADJUST_PLAN_AND_APPEND = 'adjust_plan_and_append',
    }
}
