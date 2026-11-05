export type ReceivePurchaseReceiptItemDto = {
    /**
     * 实际到货数量（收货单位），新建/编辑收货的唯一数量输入；后端按收货单位换算为基础单位并冻结
     */
    arrivalReceiptQty?: number;
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 手工单价币别
     */
    currency?: string;
    /**
     * 前端当前采购入库单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 采购入库单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 折扣率（%），100 表示无折扣；例如 9 折传 90
     */
    discountRate?: number;
    /**
     * 供应商批号有效期至；未提供时按物料保质期与生产日期计算
     */
    expiryDate?: string;
    /**
     * 入库品质等级（material_grade 字典值，向批次成本快照传播）
     */
    grade?: string;
    /**
     * 采购入库单明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 本行确认入库仓位ID；是否必填由入库仓库仓位管控模式决定
     */
    locationId?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
    /**
     * 供应商批号生产日期
     */
    productionDate?: string;
    /**
     * 来源采购订单明细ID；从采购订单收货时作为行级权威关联
     */
    purchaseOrderItemId?: string;
    /**
     * 兼容旧调用的合格入库数量；新调用仅传 arrivalReceiptQty（全量现场拒收亦可）
     */
    quantity?: number;
    /**
     * 兼容旧调用的合格入库收货单位数量
     */
    receiptQty?: number;
    /**
     * 收货单位；不传则使用物料基础单位
     */
    receiptUnit?: string;
    /**
     * 拒收原因
     */
    rejectReason?: string;
    /**
     * 兼容旧调用的现场直接拒收数量（基础单位）；新调用请传 rejectedReceiptQty
     */
    rejectedQty?: number;
    /**
     * 现场直接拒收数量（收货单位）；由后端按本行收货单位换算为基础单位保存，不入库、不计应付
     */
    rejectedReceiptQty?: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 本行入库存放位置文本；未启用仓位管控时仅作为位置快照记录
     */
    storageLocation?: string;
    /**
     * 供应商原始来料批号
     */
    supplierBatchNo?: string;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string;
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 单价；未定价入库可不填，选择同步供应商价格时必填
     */
    unitPrice?: number | null;
    /**
     * 实际入库仓库ID；有合格入库数量的明细在确认前必须指定。未传时依次使用表头默认入库仓、物料主档默认仓
     */
    warehouseId?: string;
};
