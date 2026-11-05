import type { BomItem } from './BomItem.d.ts';
import type { Material } from './Material.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq.d.ts';
export type WorkOrderMaterialSubstitution = {
    approvedAt?: string | null;
    approvedBy?: string | null;
    approver?: User | null;
    bomItem?: BomItem | null;
    bomItemId?: string | null;
    companyId: string;
    /**
     * 单位和比例快照
     */
    conversionSnapshot: Record<string, any>;
    createdAt: string;
    id: string;
    materialReq?: WorkOrderMaterialReq;
    materialReqId: string;
    originalMaterial?: Material;
    /**
     * 计划原物料档案ID
     */
    originalMaterialId: string;
    /**
     * 替代原因
     */
    reason: string;
    /**
     * 替代前需求数量
     */
    requiredQtyBefore: number;
    stockTransaction?: StockTransaction | null;
    stockTransactionId?: string | null;
    substituteMaterial?: Material;
    /**
     * 实际替代物料档案ID
     */
    substituteMaterialId: string;
    /**
     * 替代实际数量
     */
    substituteQty: number;
    updatedAt: string;
    workOrder?: WorkOrder;
    workOrderId: string;
};
