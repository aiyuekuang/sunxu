import type { Material } from './Material.d.ts';
import type { MaterialBatch } from './MaterialBatch.d.ts';
import type { MaterialPackageSpec } from './MaterialPackageSpec.d.ts';
import type { PackageType } from './PackageType.d.ts';
import type { PackageUnitLine } from './PackageUnitLine.d.ts';
import type { PackageUnitSourceType } from './PackageUnitSourceType.d.ts';
import type { PackageUnitStatus } from './PackageUnitStatus.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
export type PackageUnit = {
    batch?: MaterialBatch | null;
    batchId?: string | null;
    /**
     * 批号快照
     */
    batchNo?: string | null;
    cancelledAt?: string | null;
    cancelledBy?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    /**
     * 明细行数
     */
    lineCount: number;
    lines?: Array<PackageUnitLine>;
    location?: WarehouseLocation | null;
    /**
     * 当前仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    packageNo: string;
    packageSpec?: MaterialPackageSpec | null;
    packageSpecId?: string | null;
    packageType: PackageType;
    printedAt?: string | null;
    printedBy?: string | null;
    remarks?: string | null;
    /**
     * 补打次数
     */
    reprintCount: number;
    saleDeliveryOrderId?: string | null;
    shippedAt?: string | null;
    shippedBy?: string | null;
    sourceTransactionId?: string | null;
    sourceType: PackageUnitSourceType;
    sourceWorkOrder?: WorkOrder | null;
    sourceWorkOrderId?: string | null;
    status: PackageUnitStatus;
    /**
     * 当前存放位置快照
     */
    storageLocationSnapshot?: string | null;
    /**
     * 总数量
     */
    totalQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse;
    warehouseId: string;
};
