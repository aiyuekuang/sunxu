export type SaleOrderLogisticsLineDto = {
    /**
     * 运费条款/承担方（非应收权威）
     */
    freightPayer?: SaleOrderLogisticsLineDto.freightPayer;
    /**
     * 交付要求行ID（仅前端识别用）。后端整组替换不按 id 合并，更新时请回传完整交付要求集合。
     */
    id?: string;
    /**
     * 交付要求行号
     */
    lineNo?: number;
    /**
     * 指定承运商/物流公司（非实际物流事实）
     */
    logisticsCarrier?: string;
    /**
     * 运输/交付方式
     */
    logisticsMethod?: string;
    /**
     * 交付说明/运输备注
     */
    logisticsRemarks?: string;
    /**
     * 预估/约定运费金额（非应收权威）
     */
    plannedFreightAmount?: number | null;
    /**
     * 预估/约定运费币种
     */
    plannedFreightCurrency?: string;
    /**
     * 客户参考单号/预约单号（非实际物流单号）
     */
    plannedTrackingNo?: string;
    /**
     * 适用的销售订单明细行ID列表；为空表示适用于整张订单
     */
    saleOrderItemIds?: Array<string>;
};
export declare namespace SaleOrderLogisticsLineDto {
    /**
     * 运费条款/承担方（非应收权威）
     */
    enum freightPayer {
        CUSTOMER = "customer",
        COMPANY = "company",
        COLLECT = "collect",
        THIRD_PARTY = "third_party"
    }
}
