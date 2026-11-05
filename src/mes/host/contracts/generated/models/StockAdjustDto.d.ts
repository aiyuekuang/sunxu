export type StockAdjustDto = {
    /**
     * 调整数量：正数=盘盈/调增，负数=盘亏/调减
     */
    adjustQty: number;
    /**
     * 批号；批号追踪物料调整时必填
     */
    batchNo?: string;
    /**
     * 实际调整日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * 线边客户货主ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 调增批号有效期至；供应商标签日期优先
     */
    expiryDate?: string;
    /**
     * 调整仓位ID；是否必填由仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 调整物料档案ID
     */
    materialId: string;
    /**
     * 线边货主ID；公司库存默认为 companyId
     */
    ownerRefId?: string;
    /**
     * 线边库存货主类型；普通库存调整不支持直接调整非公司货主库存
     */
    ownerType?: StockAdjustDto.ownerType;
    /**
     * 调增批号生产日期；保质期物料可据此计算有效期
     */
    productionDate?: string;
    /**
     * 调整原因/备注
     */
    remarks?: string;
    /**
     * P0 存放位置文本；不参与库存余额主键
     */
    storageLocation?: string;
    /**
     * 调整仓库ID
     */
    warehouseId: string;
};
export declare namespace StockAdjustDto {
    /**
     * 线边库存货主类型；普通库存调整不支持直接调整非公司货主库存
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}
