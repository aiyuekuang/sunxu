import type { Material } from './Material.d.ts';
import type { PurchaseRequisition } from './PurchaseRequisition.d.ts';
import type { Supplier } from './Supplier.d.ts';
export type PurchaseRequisitionItem = {
    companyId: string;
    createdAt: string;
    currentStock: number;
    /**
     * 期望到货日期（申请行期望到货，可带入采购订单明细交货日期）
     */
    expectedArrivalDate?: string | null;
    /**
     * 采购品质等级（material_grade 字典值）
     */
    grade?: string | null;
    id: string;
    material?: Material;
    materialId: string;
    orderedQty: number;
    remarks?: string | null;
    requiredQty: number;
    requisition?: PurchaseRequisition;
    requisitionId: string;
    /**
     * 行排序号，从0开始
     */
    sortOrder: number;
    /**
     * 建议采购日期（申请行计划建议，不自动默认）
     */
    suggestedPurchaseDate?: string | null;
    supplier?: Supplier | null;
    supplierId?: string | null;
    /**
     * 来源价目行ID（供应商价格档）
     */
    supplierPriceTierId?: string | null;
    updatedAt: string;
};
