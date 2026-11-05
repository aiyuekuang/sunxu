/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PurchaseReturnFromReceiptItemDto = {
    /**
     * 本行退货数量；不得超过该行可退数量，0 表示本行不退
     */
    returnQty: number;
    /**
     * 来源采购入库单明细ID
     */
    sourceReceiptItemId: string;
};
