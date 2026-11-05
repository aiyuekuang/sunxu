import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { Material } from './Material.d.ts';
import type { StockCountOrder } from './StockCountOrder.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type StockCountLine = {
    /**
     * 实盘数量
     */
    actualQty?: number | null;
    adjustTransaction?: StockTransaction | null;
    /**
     * 审核过账生成的库存流水ID
     */
    adjustTransactionId?: string | null;
    /**
     * 批号
     */
    batchNo?: string | null;
    /**
     * 账面数量
     */
    bookQty: number;
    companyId: string;
    createdAt: string;
    /**
     * 冻结数量快照
     */
    frozenQty: number;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 仓位ID
     */
    locationId?: string | null;
    material?: Material;
    /**
     * 物料ID
     */
    materialId: string;
    order?: StockCountOrder;
    /**
     * 盘点单ID
     */
    orderId: string;
    /**
     * 库存货主ID
     */
    ownerRefId: string;
    /**
     * 库存货主类型
     */
    ownerType: InventoryOwnerType;
    /**
     * 行备注
     */
    remarks?: string | null;
    /**
     * 占用数量快照
     */
    reservedQty: number;
    /**
     * 仓位/存放位置快照
     */
    storageLocationSnapshot?: string | null;
    updatedAt: string;
    /**
     * 差异数量；实盘 - 账面
     */
    varianceQty?: number | null;
    warehouse?: Warehouse;
    /**
     * 仓库ID
     */
    warehouseId: string;
};
