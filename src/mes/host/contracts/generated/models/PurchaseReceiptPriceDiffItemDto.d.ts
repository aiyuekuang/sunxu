export type PurchaseReceiptPriceDiffItemDto = {
    /**
     * 当前生效价（无记录则为空）
     */
    currentUnitPrice?: number | null;
    /**
     * 差额（新价-旧价）
     */
    deltaAmount: number;
    /**
     * 差异比例（%）
     */
    deltaRate: number;
    /**
     * 入库品质等级
     */
    grade?: string | null;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName: string;
    /**
     * 本次入库单价
     */
    newUnitPrice: number;
    /**
     * 当前匹配价目行ID
     */
    supplierPriceTierId?: string | null;
};
