export type CreateRequisitionItemDto = {
    /**
     * 前端当前采购申请明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 采购申请明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 期望到货日期（YYYY-MM-DD，不填则为空）
     */
    expectedArrivalDate?: string;
    /**
     * 采购品质等级（material_grade 字典值）
     */
    grade?: string;
    /**
     * 采购申请明细ID；更新时用于保留行级自定义字段
     */
    id?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 需求数量
     */
    requiredQty: number;
    /**
     * 建议采购日期（YYYY-MM-DD，不填则为空）
     */
    suggestedPurchaseDate?: string;
    /**
     * 指定供应商ID
     */
    supplierId?: string;
    /**
     * 来源价目行ID（供应商价格档）
     */
    supplierPriceTierId?: string;
};
