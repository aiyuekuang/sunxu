export type ReceiveSaleReturnItemDto = {
    /**
     * 实收批号
     */
    batchNo?: string;
    /**
     * 处置方式：可再销售=入收货仓成为可用库存；不良待处置/返工/报废/待处理=入不良品仓隔离，不占用可用库存；退回客户=不入库不退款。不传则沿用退货明细处置（默认可再销售）
     */
    disposition?: ReceiveSaleReturnItemDto.disposition;
    /**
     * 销售退货明细ID
     */
    id: string;
    /**
     * 入库仓位ID
     */
    locationId?: string;
    /**
     * 本次实收数量；允许为 0，不传则沿用退货明细实收数量或申请数量
     */
    receivedQty?: number;
    /**
     * 收货备注
     */
    remarks?: string;
    /**
     * 入库存放位置文本
     */
    storageLocation?: string;
    /**
     * 隔离目标仓ID：处置为不良/返工/报废/待处理时可指定隔离仓；不传则自动路由到公司不良品仓
     */
    targetWarehouseId?: string;
};
export declare namespace ReceiveSaleReturnItemDto {
    /**
     * 处置方式：可再销售=入收货仓成为可用库存；不良待处置/返工/报废/待处理=入不良品仓隔离，不占用可用库存；退回客户=不入库不退款。不传则沿用退货明细处置（默认可再销售）
     */
    enum disposition {
        RESELLABLE = "resellable",
        PENDING = "pending",
        DEFECTIVE = "defective",
        SCRAP = "scrap",
        REWORK = "rework",
        REJECT_TO_CUSTOMER = "reject_to_customer"
    }
}
