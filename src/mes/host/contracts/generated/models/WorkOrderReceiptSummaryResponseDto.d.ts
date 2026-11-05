export type WorkOrderReceiptSummaryResponseDto = {
    /**
     * 已核销/转出数量
     */
    disposedQty: number;
    /**
     * 生产输出暂存未处理数量
     */
    outputBufferOpenQty: number;
    /**
     * 待确认生产入库数量
     */
    pendingReceiptCount: number;
    /**
     * 待确认入库数量（占用中）
     */
    pendingReceiptQty: number;
    /**
     * 生产输出质量待处置数量
     */
    qualityHoldQty: number;
    /**
     * 已确认入库数量
     */
    receivedQty: number;
};
