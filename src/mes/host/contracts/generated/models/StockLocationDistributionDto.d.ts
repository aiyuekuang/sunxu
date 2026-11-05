export type StockLocationDistributionDto = {
    /**
     * 批号；传入后按批号结存过滤仓位
     */
    batchNo?: string;
    /**
     * 客户ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 物料档案ID；为空时返回仓库下全部有库存仓位
     */
    materialId?: string;
    /**
     * 最小可用量；用于出库候选仓位过滤
     */
    minAvailableQty?: number;
    /**
     * 货主ID；公司库存默认为 companyId
     */
    ownerRefId?: string;
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    ownerType?: StockLocationDistributionDto.ownerType;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
export declare namespace StockLocationDistributionDto {
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}
