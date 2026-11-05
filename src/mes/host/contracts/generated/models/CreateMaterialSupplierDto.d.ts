export type CreateMaterialSupplierDto = {
    /**
     * 是否为默认供应商
     */
    isDefault?: boolean;
    /**
     * 该供应商交货提前期（天）
     */
    leadTimeDays?: number;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 该供应商最小起订量
     */
    minOrderQty?: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 供应商ID
     */
    supplierId: string;
    /**
     * 供应商物料编号
     */
    supplierMaterialCode?: string;
    /**
     * 供应商物料名称
     */
    supplierMaterialName?: string;
    /**
     * 价格生效日期（默认当天）
     */
    validFrom?: string;
};
