export type ConvertedPurchaseOrderDto = {
    /**
     * 采购订单ID
     */
    id: string;
    /**
     * 采购订单号
     */
    orderNo: string;
    /**
     * 供应商名称快照
     */
    partnerNameSnapshot?: string | null;
    /**
     * 关联采购申请ID
     */
    requisitionId?: string | null;
    /**
     * 采购订单状态
     */
    status: ConvertedPurchaseOrderDto.status;
    /**
     * 供应商ID
     */
    supplierId: string;
};
export declare namespace ConvertedPurchaseOrderDto {
    /**
     * 采购订单状态
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        CONFIRMED = "confirmed",
        PARTIALLY_RECEIVED = "partially_received",
        RECEIVED = "received",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
    }
}
