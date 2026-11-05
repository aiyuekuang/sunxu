export type ReverseProductionReceiptDto = {
    /**
     * 实际冲正业务日期；不传时后端按当天处理，不复用原入库日期
     */
    businessDate?: string;
    /**
     * 生产入库单ID
     */
    id: string;
    /**
     * 冲正原因（production_receipt_reverse_reason 字典值，原因项声明回暂存、最终核销或质量待处置动作）
     */
    reverseReason: string;
};
