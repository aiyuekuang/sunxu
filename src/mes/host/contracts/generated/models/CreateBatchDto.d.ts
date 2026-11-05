export type CreateBatchDto = {
    /**
     * 批号（留空则自动生成）
     */
    batchNo?: string;
    expiryDate?: string;
    /**
     * 批号品质等级（material_grade 字典值）
     */
    grade?: string;
    /**
     * 物料档案ID
     */
    materialId: string;
    productionDate?: string;
    /**
     * 兼容旧客户端字段。批号管理不直接过账库存；不传或传 0 表示仅建档，正数量必须走库存入库/库存调整。
     */
    qty?: number;
    /**
     * 供应商原始批号
     */
    supplierBatchNo?: string;
    supplierId?: string;
    /**
     * 来源价目行ID
     */
    supplierPriceTierId?: string;
    warehouseId: string;
};
