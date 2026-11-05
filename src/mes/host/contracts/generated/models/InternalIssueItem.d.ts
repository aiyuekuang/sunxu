import type { InternalIssueOrder } from './InternalIssueOrder.d.ts';
import type { Material } from './Material.d.ts';
import type { MaterialBatch } from './MaterialBatch.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type InternalIssueItem = {
    amountSnapshot?: number | null;
    batch?: MaterialBatch | null;
    batchId?: string | null;
    batchNo?: string | null;
    companyId: string;
    createdAt: string;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 实际出库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    order?: InternalIssueOrder;
    orderId: string;
    qty: number;
    remarks?: string | null;
    stockTransaction?: StockTransaction | null;
    stockTransactionId?: string | null;
    /**
     * 实际出仓位置快照
     */
    storageLocationSnapshot?: string | null;
    unitCostSnapshot?: number | null;
    updatedAt: string;
    warehouse?: Warehouse;
    warehouseId: string;
};
