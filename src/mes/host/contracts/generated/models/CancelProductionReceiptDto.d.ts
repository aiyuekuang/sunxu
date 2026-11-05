export type CancelProductionReceiptDto = {
    /**
     * 生产入库单ID
     */
    id: string;
    /**
     * 取消原因
     */
    reason: string;
};
