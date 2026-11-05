export type ConvertPrToOrderItemDto = {
    /**
     * 本次转单数量
     */
    orderedQty: number;
    /**
     * 采购申请行项ID
     */
    requisitionItemId: string;
    /**
     * 本次转单指定供应商ID；不传则按申请行、物料默认供应商、供应商物料资料判定
     */
    supplierId?: string;
};
