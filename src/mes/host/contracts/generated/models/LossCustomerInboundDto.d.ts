export type LossCustomerInboundDto = {
    /**
     * 损耗/遗失发生日期；库存化客户料据此写入库存业务日期，不传时后端按当天处理
     */
    disposedAt?: string;
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
     * 异常类型：遗失或作废/损耗
     */
    lossType: LossCustomerInboundDto.lossType;
    /**
     * 损耗/遗失数量；不填时默认处理当前来源余额，支持部分和多次处理
     */
    qty?: number;
    /**
     * 异常说明
     */
    remark?: string;
    /**
     * 实际出库仓库ID；不传时沿用转库存时的仓库
     */
    warehouseId?: string;
};
export declare namespace LossCustomerInboundDto {
    /**
     * 异常类型：遗失或作废/损耗
     */
    enum lossType {
        LOST = "lost",
        SCRAPPED = "scrapped"
    }
}
