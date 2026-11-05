export type GenerateFromOutputBufferDto = {
    /**
     * 生产输出暂存ID
     */
    id: string;
    /**
     * 包装规格ID（覆盖物料默认包装规格）
     */
    packageSpecId?: string;
    /**
     * 生成数量（产品基础单位）；不传默认为全部待处理数量
     */
    qty?: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 非完整包装特批原因（production_receipt_special_reason 字典值）；启用完整包装策略且数量不满整包装时必填
     */
    specialReason?: string;
};
