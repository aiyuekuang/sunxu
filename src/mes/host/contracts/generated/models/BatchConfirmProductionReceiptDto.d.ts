export type BatchConfirmProductionReceiptDto = {
    /**
     * 本次批量实际入库业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
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
};
