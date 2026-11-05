import type { CustomerExternalItem } from './CustomerExternalItem.d.ts';
import type { CustomerMaterialDispositionOrder } from './CustomerMaterialDispositionOrder.d.ts';
import type { InventorySourceLayer } from './InventorySourceLayer.d.ts';
import type { Material } from './Material.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type CustomerMaterialDispositionItem = {
    /**
     * 批号
     */
    batchNo?: string | null;
    createdAt: string;
    /**
     * 自定义公式字段计算错误
     */
    customComputedErrors?: Record<string, any>;
    /**
     * 自定义公式字段计算值
     */
    customComputedValues?: Record<string, any>;
    /**
     * 自定义字段 schema 版本
     */
    customFieldSchemaVersion?: number;
    /**
     * 自定义字段值
     */
    customValues?: Record<string, any>;
    customerInbound?: CustomerExternalItem | null;
    /**
     * 来源客户来料登记ID；历史未分摊来源为空
     */
    customerInboundId?: string | null;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 仓位ID
     */
    locationId?: string | null;
    material?: Material | null;
    /**
     * 物料ID；未关联正式物料的外来物品为空
     */
    materialId?: string | null;
    order?: CustomerMaterialDispositionOrder;
    /**
     * 客户料处置单ID
     */
    orderId: string;
    /**
     * 处置数量
     */
    qty: number;
    sourceLayer?: InventorySourceLayer | null;
    /**
     * 库存来源层ID；未转库存的外来物品为空
     */
    sourceLayerId?: string | null;
    stockTransaction?: StockTransaction | null;
    /**
     * 生成的库存出库流水ID；未转库存的外来物品为空
     */
    stockTransactionId?: string | null;
    updatedAt: string;
    warehouse?: Warehouse | null;
    /**
     * 实际出库仓库ID；未转库存的外来物品为空
     */
    warehouseId?: string | null;
};
