export type ProductionReceiptPrecheckDto = {
    /**
     * 生产入库单ID（确认前预检）
     */
    receiptId?: string;
    /**
     * 工单ID（报工前策略预检）
     */
    workOrderId?: string;
};
