export type StockLocationPrecheckDto = {
    /**
     * 库存动作编码
     */
    action: string;
    /**
     * 仓位ID
     */
    locationId?: string;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
