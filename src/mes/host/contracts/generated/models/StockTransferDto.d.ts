export type StockTransferDto = {
    /**
     * 批号；批号追踪物料调拨时必填
     */
    batchNo?: string;
    /**
     * 调拨库存业务日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * 来源仓位ID；是否必填由来源仓库仓位管控模式决定
     */
    fromLocationId?: string;
    /**
     * 来源位置文本快照
     */
    fromStorageLocation?: string;
    /**
     * 来源仓库ID
     */
    fromWarehouseId: string;
    /**
     * 调拨物料档案ID
     */
    materialId: string;
    /**
     * 调拨数量
     */
    qty: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 目标仓位ID；是否必填由目标仓库仓位管控模式决定
     */
    toLocationId?: string;
    /**
     * 目标位置文本快照
     */
    toStorageLocation?: string;
    /**
     * 目标仓库ID
     */
    toWarehouseId: string;
};
