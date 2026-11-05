export type WarehouseLocationTreeDto = {
    /**
     * 是否只返回启用仓位
     */
    activeOnly?: boolean;
    /**
     * 是否只返回允许库存落点的仓位
     */
    stockOnly?: boolean;
    /**
     * 所属仓库ID
     */
    warehouseId: string;
};
