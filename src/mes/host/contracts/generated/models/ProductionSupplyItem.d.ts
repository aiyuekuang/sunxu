import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { Material } from './Material.d.ts';
import type { ProductionSupplyOrder } from './ProductionSupplyOrder.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq.d.ts';
export type ProductionSupplyItem = {
    actualQty: number;
    batchNo?: string | null;
    companyId: string;
    createdAt: string;
    fromLocation?: WarehouseLocation | null;
    /**
     * 本次供料来源仓位ID
     */
    fromLocationId?: string | null;
    /**
     * 来源仓位快照
     */
    fromStorageLocationSnapshot?: string | null;
    id: string;
    lineSideWarehouse?: Warehouse;
    lineSideWarehouseId: string;
    material?: Material;
    materialId: string;
    materialReq?: WorkOrderMaterialReq;
    materialReqId: string;
    ownerRefId: string;
    ownerType: InventoryOwnerType;
    plannedQty: number;
    sourceWarehouse?: Warehouse;
    sourceWarehouseId: string;
    supplyOrder?: ProductionSupplyOrder;
    supplyOrderId: string;
    toLocation?: WarehouseLocation | null;
    /**
     * 本次供料目标仓位ID
     */
    toLocationId?: string | null;
    /**
     * 目标仓位快照
     */
    toStorageLocationSnapshot?: string | null;
    transferGroupId?: string | null;
    updatedAt: string;
};
