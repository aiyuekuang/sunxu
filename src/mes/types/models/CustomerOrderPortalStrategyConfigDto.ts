/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CustomerOrderPortalStrategyConfigDto = {
    /**
     * 扫码页最多展示订单数，默认 100
     */
    maxVisibleOrders?: number;
    /**
     * 已发货订单继续显示天数，默认 3 天
     */
    shippedVisibleDays?: number;
    /**
     * 扫码页可见字段白名单
     */
    visibleFields?: Array<string>;
};
