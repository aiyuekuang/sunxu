export type SaleReturnRefundableLineDto = {
    batchNo?: string | null;
    deliveredQty: number;
    locationId?: string | null;
    materialCode?: string | null;
    materialId: string;
    materialName?: string | null;
    refundableQty: number;
    returnedQty: number;
    sourceDeliveryItemId: string;
};
