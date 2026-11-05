export type SaleDeliveryExecutionItemDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 前端当前销售出库单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 销售出库单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 出库明细ID；拆分新增行可不传
     */
    id?: string;
    /**
     * 本行实际出库仓位ID；是否必填由出库仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 包装单元ID
     */
    packageUnitId?: string;
    /**
     * 包装单元明细ID
     */
    packageUnitLineId?: string;
    /**
     * 出库数量
     */
    quantity: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 关联销售订单明细行ID
     */
    saleOrderItemId?: string;
    /**
     * 本行实际出库成品序列号；序列号物料按件选择，号码数量须等于出库数量
     */
    serialNumbers?: Array<string>;
    /**
     * 本行出库存放位置文本；未启用仓位管控时仅作为位置快照记录
     */
    storageLocation?: string;
};
