export type OutboundPurchaseReturnItemDto = {
    /**
     * 出库批号
     */
    batchNo?: string;
    /**
     * 采购退料明细ID
     */
    id: string;
    /**
     * 出库仓位ID
     */
    locationId?: string;
    /**
     * 本次退库出库数量；允许为 0，不传则沿用申请退货数量
     */
    outboundQty?: number;
    /**
     * 出库备注
     */
    remarks?: string;
    /**
     * 出库存放位置文本
     */
    storageLocation?: string;
};
