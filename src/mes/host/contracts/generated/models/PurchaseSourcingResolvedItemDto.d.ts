export type PurchaseSourcingResolvedItemDto = {
    /**
     * 本次转单数量
     */
    convertQty: number;
    /**
     * 物料档案编码
     */
    materialCode?: string | null;
    /**
     * 物料档案ID
     */
    materialId: string;
    /**
     * 物料档案名称
     */
    materialName?: string | null;
    /**
     * 物料档案单位
     */
    materialUnit?: string | null;
    /**
     * 已下单数量
     */
    orderedQty: number;
    /**
     * 剩余可转数量
     */
    remainingQty: number;
    /**
     * 行备注
     */
    remarks?: string | null;
    /**
     * 需求数量
     */
    requiredQty: number;
    /**
     * 采购申请行项ID
     */
    requisitionItemId: string;
    /**
     * 采购申请行指定供应商ID
     */
    requisitionSupplierId?: string | null;
    /**
     * 本次转单指定供应商ID
     */
    selectedSupplierId?: string | null;
    /**
     * 供应来源
     */
    source: PurchaseSourcingResolvedItemDto.source;
    /**
     * 解析出的供应商ID
     */
    supplierId: string;
    /**
     * 解析出的供应商名称
     */
    supplierName: string;
};
export declare namespace PurchaseSourcingResolvedItemDto {
    /**
     * 供应来源
     */
    enum source {
        SELECTED = "selected",
        REQUISITION = "requisition",
        MATERIAL_DEFAULT = "material_default",
        MATERIAL_SUPPLIER_DEFAULT = "material_supplier_default",
        SINGLE_MATERIAL_SUPPLIER = "single_material_supplier"
    }
}
