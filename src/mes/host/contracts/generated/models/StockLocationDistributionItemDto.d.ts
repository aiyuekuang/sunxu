export type StockLocationDistributionItemDto = {
    /**
     * 可用数量
     */
    availableQty: number;
    /**
     * 冻结数量
     */
    frozenQty: number;
    /**
     * 仓位条码
     */
    locationBarcode?: string | null;
    /**
     * 仓位编码
     */
    locationCode?: string | null;
    /**
     * 仓位ID；为空表示仓库级未分配库存
     */
    locationId?: string | null;
    /**
     * 仓位名称
     */
    locationName?: string | null;
    /**
     * 仓位路径
     */
    locationPath?: string | null;
    /**
     * 库存数量
     */
    quantity: number;
    /**
     * 占用数量
     */
    reservedQty: number;
};
