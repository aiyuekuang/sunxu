export type ProductionReceiptStatsResponseDto = {
    /**
     * 未关闭暂存记录数
     */
    openBufferCount: number;
    /**
     * 生产输出暂存未处理总数量
     */
    outputBufferOpenQty: number;
    /**
     * 超过 24 小时未确认的单数
     */
    overduePendingCount: number;
    /**
     * 待确认生产入库数量
     */
    pendingCount: number;
    /**
     * 待确认入库总数量
     */
    pendingQty: number;
    /**
     * 生产输出质量待处置总数量
     */
    qualityHoldQty: number;
};
