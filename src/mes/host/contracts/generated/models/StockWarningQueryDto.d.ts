export type StockWarningQueryDto = {
    /**
     * 物料ID
     */
    materialId?: string;
    /**
     * 货主类型
     */
    ownerType?: StockWarningQueryDto.ownerType;
    /**
     * 仓库ID
     */
    warehouseId?: string;
};
export declare namespace StockWarningQueryDto {
    /**
     * 货主类型
     */
    enum ownerType {
        COMPANY = "company",
        CUSTOMER = "customer",
        SUPPLIER = "supplier"
    }
}
