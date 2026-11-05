export type StockCheckDto = {
    /**
     * 仓位ID；不传时按仓库汇总检查
     */
    locationId?: string;
    materialId: string;
    requiredQty: number;
    warehouseId: string;
};
