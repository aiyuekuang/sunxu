export type StockUnfreezeDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 客户ID；传入后等同于 ownerType=customer + ownerRefId=客户ID
     */
    customerId?: string;
    /**
     * 冻结仓位ID；启用严格仓位管控的仓库必填，可选仓按库存行处理
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
     * 库存货主类型；不传默认公司自有库存
     */
    ownerType?: StockUnfreezeDto.ownerType;
    /**
     * 冻结数量
     */
    qty: number;
    /**
     * 冻结原因/备注
     */
    remarks?: string;
    /**
     * P0 位置文本快照
     */
    storageLocation?: string;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
export declare namespace StockUnfreezeDto {
    /**
     * 库存货主类型；不传默认公司自有库存
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}
