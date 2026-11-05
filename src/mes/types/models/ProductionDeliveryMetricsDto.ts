/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProductionDeliveryMetricsDto = {
    /**
     * 客户交期落在判定窗口内的工单数，排除草稿和已取消
     */
    deliveryEligibleWorkOrders: number;
    /**
     * 客户交期判定窗口开始日期，等于所选期间开始日期
     */
    dueWindowFrom: string;
    /**
     * 交期已完整经过的截止日期，不晚于今天前一日
     */
    dueWindowTo: string;
    /**
     * 在客户交期当日或之前实际完工的工单数
     */
    onTimeCompletedWorkOrders: number;
    /**
     * 按客户交期统计的按期率；判定窗口内无工单时为 null
     */
    onTimeDeliveryRate?: number | null;
    /**
     * 交期已过但未按期完工的工单数
     */
    overdueNotDeliveredWorkOrders: number;
};
