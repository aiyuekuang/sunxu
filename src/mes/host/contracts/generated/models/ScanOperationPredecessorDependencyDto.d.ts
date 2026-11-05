export type ScanOperationPredecessorDependencyDto = {
    /**
     * 最小良品放行数量
     */
    minGoodQty?: number | null;
    /**
     * 前置工序ID
     */
    predecessorOperationId: string;
    /**
     * 转移批量
     */
    transferBatchQty?: number | null;
};
