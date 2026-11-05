export type StockInDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 实际入库日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * 批号有效期至；供应商标签日期优先于系统计算
     */
    expiryDate?: string;
    /**
     * 入库批号等级（material_grade 字典值）
     */
    grade?: string;
    /**
     * 入库仓位ID；是否必填由仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 入库物料档案ID
     */
    materialId: string;
    /**
     * 现场照片 URL 列表
     */
    photoUrls?: Array<string>;
    /**
     * 批号生产日期；保质期物料用于计算有效期
     */
    productionDate?: string;
    /**
     * 入库数量
     */
    qty: number;
    /**
     * 入库原因码；其他入库建议传盘盈、初始化、样品、历史调整等非经营性原因
     */
    reasonCode?: string;
    /**
     * 关联单据ID
     */
    referenceId?: string;
    /**
     * 关联单号
     */
    referenceNo?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * P0 存放位置文本；不参与库存余额主键
     */
    storageLocation?: string;
    /**
     * 供应商原始批号
     */
    supplierBatchNo?: string;
    /**
     * 供应商ID
     */
    supplierId?: string;
    /**
     * 供应商价目来源ID
     */
    supplierPriceTierId?: string;
    /**
     * 直接入库类型：in_return=退料入库，in_other=其他入库；完工入库必须走生产入库确认或工单报工
     */
    type: StockInDto.type;
    /**
     * 入库仓库ID
     */
    warehouseId: string;
};
export declare namespace StockInDto {
    /**
     * 直接入库类型：in_return=退料入库，in_other=其他入库；完工入库必须走生产入库确认或工单报工
     */
    enum type {
        IN_RETURN = "in_return",
        IN_OTHER = "in_other"
    }
}
