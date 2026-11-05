export type PurchaseReturnReturnableLineDto = {
    /**
     * 基础库存单位
     */
    baseUnit?: string | null;
    batchNo?: string | null;
    /**
     * 收货单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    locationId?: string | null;
    materialCode?: string | null;
    materialId: string;
    materialName?: string | null;
    /**
     * 收货业务单位
     */
    receiptUnit?: string | null;
    /**
     * 已入库数量（基础单位）
     */
    receivedQty: number;
    /**
     * 可退数量（基础单位）
     */
    returnableQty: number;
    /**
     * 已占用退货数量（基础单位）
     */
    returnedQty: number;
    sourceReceiptItemId: string;
    /**
     * 来源入库行单价（每收货业务单位）；未定价为空
     */
    unitPrice?: number | null;
    /**
     * 来源入库明细的实际入库仓ID；历史行回退旧单头仓
     */
    warehouseId?: string | null;
};
