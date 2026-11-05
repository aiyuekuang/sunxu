export type PreviewPurchaseReceiptSourceDto = {
    /**
     * 编辑采购入库单时排除自身草稿占用的采购入库单ID
     */
    excludeReceiptId?: string;
    /**
     * 来源采购订单ID
     */
    purchaseOrderId: string;
};
