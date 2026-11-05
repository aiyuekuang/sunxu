/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { MaterialBatch } from './MaterialBatch';
import type { MaterialIssueOrder } from './MaterialIssueOrder';
import type { StockTransaction } from './StockTransaction';
import type { Warehouse } from './Warehouse';
import type { WarehouseLocation } from './WarehouseLocation';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq';
import type { WorkOrderMaterialSubstitution } from './WorkOrderMaterialSubstitution';
export type MaterialIssueItem = {
    actualQty: number;
    batch?: MaterialBatch | null;
    batchId?: string | null;
    batchNo?: string | null;
    companyId: string;
    /**
     * 显示单位到基础单位换算系数
     */
    conversionFactorToBase?: number | null;
    /**
     * 单位和替代快照
     */
    conversionSnapshot: Record<string, any>;
    createdAt: string;
    id: string;
    issueOrder?: MaterialIssueOrder;
    issueOrderId: string;
    /**
     * 显示领料数量
     */
    issueQty?: number | null;
    /**
     * 显示领料单位
     */
    issueUnit?: string | null;
    location?: WarehouseLocation | null;
    /**
     * 实际出库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    materialReq?: WorkOrderMaterialReq | null;
    materialReqId?: string | null;
    originalMaterial?: Material | null;
    /**
     * 原计划物料档案ID；替代领料时记录
     */
    originalMaterialId?: string | null;
    remarks?: string | null;
    requiredQty: number;
    stockTransaction?: StockTransaction | null;
    /**
     * 发料生成的出库流水ID（行级追溯）
     */
    stockTransactionId?: string | null;
    /**
     * 发料时仓位快照
     */
    storageLocationSnapshot?: string | null;
    substitution?: WorkOrderMaterialSubstitution | null;
    substitutionId?: string | null;
    updatedAt: string;
    warehouse?: Warehouse | null;
    /**
     * 申请发料仓库ID；工单下达自动生成的待完善申请允许为空
     */
    warehouseId?: string | null;
};
