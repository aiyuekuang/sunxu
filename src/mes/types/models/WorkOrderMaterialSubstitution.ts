/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomItem } from './BomItem';
import type { Material } from './Material';
import type { StockTransaction } from './StockTransaction';
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq';
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
