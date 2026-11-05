import type { PurchaseSourcingCandidateSupplierDto } from './PurchaseSourcingCandidateSupplierDto.d.ts';
export type PurchaseSourcingUnresolvedItemDto = {
    /**
     * 候选供应商列表
     */
    candidateSuppliers?: Array<PurchaseSourcingCandidateSupplierDto>;
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
     * 未确定供应商原因说明
     */
    reason: string;
    /**
     * 未确定供应商原因码
     */
    reasonCode: PurchaseSourcingUnresolvedItemDto.reasonCode;
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
     * 未解析供应商时固定为空
     */
    supplierId: string | null;
};
export declare namespace PurchaseSourcingUnresolvedItemDto {
    /**
     * 未确定供应商原因码
     */
    enum reasonCode {
        INVALID_SUPPLIER = "invalid_supplier",
        INACTIVE_SUPPLIER = "inactive_supplier",
        DEFAULT_SUPPLIER_INVALID = "default_supplier_invalid",
        DEFAULT_SUPPLIER_INACTIVE = "default_supplier_inactive",
        NO_SUPPLIER = "no_supplier",
        MULTIPLE_SUPPLIERS = "multiple_suppliers"
    }
}
