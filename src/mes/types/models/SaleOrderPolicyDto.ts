/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleOrderPolicyDto = {
    /**
     * 从销售订单需求归集建生产计划时默认允许的最早与最晚交期最大自然日差；默认 0，仅允许合并同一天交期
     */
    maxDemandMergeDueDateGapDays: number;
    /**
     * 转生产计划时是否要求每个转生产明细行具备交货日期（明细交货日期或订单头交货日期，默认 false）。前端据此决定订单明细交货日期列是否标必填。
     */
    requireLineDeliveryDate: boolean;
    /**
     * 确认销售订单时是否要求每个明细行具备有效单价（默认 false，允许未定价草稿/确认；开启后确认时单价为空或为 0 的明细行阻断）。
     */
    requirePricing: boolean;
};
