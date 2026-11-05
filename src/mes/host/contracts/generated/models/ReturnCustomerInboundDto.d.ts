export type ReturnCustomerInboundDto = {
    /**
     * ID
     */
    id: string;
    /**
     * 客户端幂等键；网络重试必须复用同一个值
     */
    idempotencyKey: string;
    /**
     * 实际出库仓位ID；按当前出库仓的仓位策略校验
     */
    locationId?: string;
    /**
     * 归还数量；不填时默认归还当前来源余额，支持部分和多次归还
     */
    qty?: number;
    /**
     * 归还说明
     */
    remark?: string;
    /**
     * 归还时间
     */
    returnedAt?: string;
    /**
     * 实际出库仓库ID；不传时沿用转库存时的仓库
     */
    warehouseId?: string;
};
