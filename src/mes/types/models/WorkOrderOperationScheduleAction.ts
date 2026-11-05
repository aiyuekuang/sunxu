/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 根据工单执行状态和当前有效排产派生的操作提示；不属于工单或排产实例生命周期状态
 */
export enum WorkOrderOperationScheduleAction {
    NONE = 'none',
    FOLLOW_UP_REPLAN = 'follow_up_replan',
    EQUIPMENT_FAULT_RECOVERY = 'equipment_fault_recovery',
}
