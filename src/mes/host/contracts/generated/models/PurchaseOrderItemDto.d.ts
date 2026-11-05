export type PurchaseOrderItemDto = {
    /**
     * 手工单价币别
     */
    currency?: string;
    /**
     * 前端当前采购订单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 采购订单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 行级交货日期（YYYY-MM-DD；分批采购各行可不同，留空回退整单预计到货）
     */
    deliveryDate?: string;
    /**
     * 折扣率（%），100 表示无折扣；例如 9 折传 90
     */
    discountRate?: number;
    /**
     * 采购品质等级（material_grade 字典值；传入时按等级查价目取价）
     */
    grade?: string;
    /**
     * 采购订单明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 订购数量
     */
    orderedQty: number;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
    /**
     * 采购单位数量；不传则使用 orderedQty
     */
    purchaseQty?: number;
    /**
     * 采购单位；不传则使用物料基础单位
     */
    purchaseUnit?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 关联采购申请行项ID
     */
    requisitionItemId?: string;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string;
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 单价
     */
    unitPrice?: number;
};
