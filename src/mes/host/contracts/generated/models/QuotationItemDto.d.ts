export type QuotationItemDto = {
    /**
     * 报价行 BOM 成本快照；为空时后端按选定 BOM 自动生成
     */
    bomCostSnapshot?: Record<string, any>;
    /**
     * BOM 选择原因
     */
    bomSelectionReason?: string;
    /**
     * BOM 选择来源
     */
    bomSelectionSource?: string;
    /**
     * 手工单价币别
     */
    currency?: string;
    /**
     * 前端当前报价单明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 报价单明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
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
     * 报价明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 报价阶段产品参考图片URL列表
     */
    imageUrls?: Array<string>;
    /**
     * 物料档案ID；临时报价品可不传
     */
    materialId?: string;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
    /**
     * 数量
     */
    quantity: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 报价确认使用的 BOM 版本ID
     */
    selectedBomHeaderId?: string;
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 单价
     */
    unitPrice?: number;
};
