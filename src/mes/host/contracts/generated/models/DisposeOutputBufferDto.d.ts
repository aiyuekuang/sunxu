export type DisposeOutputBufferDto = {
    /**
     * 处置类型（production_output_disposal_type 字典值：scrap/rework/inventory_write_off）
     */
    disposalType: string;
    /**
     * 生产输出暂存ID
     */
    id: string;
    /**
     * 处置数量（产品基础单位）
     */
    qty: number;
    /**
     * 处置原因
     */
    reason: string;
};
