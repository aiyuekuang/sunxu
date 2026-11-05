/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 工单数量动作超过生产计划投产数量时的处理方式
 */
export enum WorkOrderPlanOverrunMode {
    WARNING = 'warning',
    BLOCKING = 'blocking',
    APPROVAL = 'approval',
    AUTO_ADJUST_PLAN = 'auto_adjust_plan',
}
