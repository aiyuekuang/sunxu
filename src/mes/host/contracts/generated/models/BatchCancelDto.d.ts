export type BatchCancelDto = {
    /**
     * 批量取消工单时扣回已入库产出的实际业务日期；不传时后端按当天处理，不允许未来日期
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
     * 取消原因
     */
    reason?: string;
};
