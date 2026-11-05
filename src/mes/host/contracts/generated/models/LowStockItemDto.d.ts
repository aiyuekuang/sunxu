import type { InventoryOwnerType } from './InventoryOwnerType.d.ts';
import type { LowStockMaterialDto } from './LowStockMaterialDto.d.ts';
import type { LowStockWarehouseDto } from './LowStockWarehouseDto.d.ts';
export type LowStockItemDto = {
    /**
     * 本条预警实际使用的阈值
     */
    alertThreshold: number;
    frozenQty: number;
    id: string;
    material?: LowStockMaterialDto;
    materialId: string;
    /**
     * 客户货主名称；公司库存为空
     */
    ownerName?: string | null;
    /**
     * 库存货主ID
     */
    ownerRefId: string;
    /**
     * 库存货主类型
     */
    ownerType: InventoryOwnerType;
    quantity: number;
    reservedQty: number;
    warehouse?: LowStockWarehouseDto;
    warehouseId: string;
};
