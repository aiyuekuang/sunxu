/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleOrderStrategyDto = {
    /**
     * 从销售订单需求归集建生产计划时默认允许的最早与最晚交期最大自然日差；默认 0，范围 0-3650
     */
    maxDemandMergeDueDateGapDays?: number;
    /**
     * 转生产计划时是否要求每个转生产明细行具备交货日期（明细交货日期或订单头交货日期）；默认关闭，草稿与确认仍不卡，仅在转生产这一真实依赖交货日期的动作上严格校验。
     */
    requireLineDeliveryDate?: boolean;
    /**
     * 确认销售订单时是否要求每个明细行具备有效单价（默认关闭，允许未定价草稿与确认；开启后确认时单价为空或为 0 的明细行阻断，报错指明行号与物料）。
     */
    requirePricing?: boolean;
};
