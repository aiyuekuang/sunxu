export type SaleDeliveryItemDto = {
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
     * 客户料号
     */
    customerMaterialCode?: string;
    /**
     * 客户物料名称
     */
    customerMaterialName?: string;
    /**
     * 客户规格/型号描述
     */
    customerMaterialSpec?: string;
    /**
     * 折扣率（%），100 表示无折扣；例如 9 折传 90
     */
    discountRate?: number;
    /**
     * 销售出库单明细ID；更新时用于保留行级自定义字段
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
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
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
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 单价；未定价出库可不填。客户协议价格请在销售价目表维护。
     */
    unitPrice?: number | null;
};
