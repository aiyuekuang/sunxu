export type WorkOrderOperationPredecessorInputDto = {
    /**
     * 该前置边的最小良品门槛
     */
    minGoodQty?: number | null;
    /**
     * 前置工序ID
     */
    predecessorOperationId: string;
    /**
     * 该前置边的转移批量门槛
     */
    transferBatchQty?: number | null;
};
