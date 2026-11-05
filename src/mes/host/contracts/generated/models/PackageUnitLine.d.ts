import type { Material } from './Material.d.ts';
import type { MaterialBatch } from './MaterialBatch.d.ts';
import type { PackageUnit } from './PackageUnit.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type PackageUnitLine = {
    batch?: MaterialBatch | null;
    batchId?: string | null;
    /**
     * 批号快照
     */
    batchNo?: string | null;
    companyId: string;
    createdAt: string;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 当前仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    packageUnit?: PackageUnit;
    packageUnitId: string;
    qty: number;
    remarks?: string | null;
    sourceTransactionId?: string | null;
    sourceWorkOrderId?: string | null;
    /**
     * 当前存放位置快照
     */
    storageLocationSnapshot?: string | null;
    updatedAt: string;
    warehouse?: Warehouse;
    warehouseId: string;
};
