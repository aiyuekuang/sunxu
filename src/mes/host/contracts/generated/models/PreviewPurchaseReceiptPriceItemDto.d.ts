export type PreviewPurchaseReceiptPriceItemDto = {
    /**
     * 折扣率（%），100 表示无折扣；例如 9 折传 90
     */
    discountRate?: number;
    /**
     * 入库品质等级（material_grade 字典值）
     */
    grade?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean;
    /**
     * 入库数量；用于匹配数量阶梯价
     */
    quantity?: number;
    /**
     * 税率（%）
     */
    taxRate?: number;
    /**
     * 入库单价
     */
    unitPrice: number;
};
