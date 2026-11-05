export type StockBalancePreviewDto = {
    /**
     * 本次调整数量；用于显示调整后账面数量
     */
    adjustQty?: number;
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 客户ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 仓位ID；为空时按仓库汇总，启用严格仓位管控的仓库会返回 blocker
     */
    locationId?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 货主ID；公司库存默认为 companyId
     */
    ownerRefId?: string;
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    ownerType?: StockBalancePreviewDto.ownerType;
    /**
     * 本次需求数量；用于显示是否充足，不作为最终出库校验
     */
    requiredQty?: number;
    /**
     * P0 存放位置文本；只作为位置快照，不参与库存余额主键
     */
    storageLocation?: string;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
export declare namespace StockBalancePreviewDto {
    /**
     * 库存货主类型；不传默认查看公司自有库存
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}
