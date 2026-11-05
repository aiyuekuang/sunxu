export type BatchAdjustItemDto = {
    /**
     * 调整仓位ID；是否必填由仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 调整物料档案ID
     */
    materialId: string;
    /**
     * 调整数量：正数=盘盈/调增，负数=盘亏/调减；批号追踪物料不支持批量无批号调整
     */
    quantity: number;
    /**
     * 调整原因
     */
    reason: string;
    /**
     * 位置文本快照
     */
    storageLocation?: string;
    /**
     * 调整仓库ID
     */
    warehouseId: string;
};
