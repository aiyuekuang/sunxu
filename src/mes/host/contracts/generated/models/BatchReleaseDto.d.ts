export type BatchReleaseDto = {
    /**
     * 指派负责人ID
     */
    assigneeId?: string;
    /**
     * 客户端批量请求幂等键；同一动作重试时必须保持不变
     */
    clientRequestId: string;
    /**
     * ID 列表
     */
    ids: Array<string>;
    /**
     * 高风险批量动作预检令牌
     */
    previewToken?: string;
    /**
     * 批量操作原因
     */
    reason?: string;
    /**
     * 批量下达时统一指定入库仓库ID（可选）
     */
    receiptWarehouseId?: string;
};
