export type SaleReturnFromDeliveryDto = {
    /**
     * 退货原因字典值（从销售出库单下推创建草稿时必填）
     */
    reasonCode: string;
    /**
     * 来源销售出库单ID
     */
    sourceDeliveryId: string;
};
