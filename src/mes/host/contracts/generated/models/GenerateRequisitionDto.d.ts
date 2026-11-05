export type GenerateRequisitionDto = {
    /**
     * 指定MRP运行明细ID；不传则发放全部待采购明细
     */
    itemIds?: Array<string>;
    /**
     * 生产计划ID列表；兼容旧调用，建议先运行MRP后传runId
     */
    planIds?: Array<string>;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * MRP运行ID；优先使用该快照生成采购申请
     */
    runId?: string;
    /**
     * 安全库存天数
     */
    safetyStockDays?: number;
};
