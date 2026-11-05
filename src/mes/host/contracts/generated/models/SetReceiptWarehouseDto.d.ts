export type SetReceiptWarehouseDto = {
    /**
     * 工单ID
     */
    id: string;
    /**
     * 设置/变更完工入库仓的原因（审计留痕）
     */
    reason?: string;
    /**
     * 补设/冻结的完工入库仓库ID
     */
    receiptWarehouseId: string;
};
