export type InternalIssueItemDto = {
    /**
     * 批号；启用批号追踪的物料确认领用时必填
     */
    batchNo?: string;
    /**
     * 前端当前内部领用明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 内部领用明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 内部领用明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 实际出库仓位ID；是否必填由出库仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 领用数量
     */
    qty: number;
    /**
     * 行备注
     */
    remarks?: string;
    /**
     * 实际出仓位置文本；未启用仓位管控时仅作为位置快照记录
     */
    storageLocation?: string;
    /**
     * 出库仓库ID
     */
    warehouseId: string;
};
