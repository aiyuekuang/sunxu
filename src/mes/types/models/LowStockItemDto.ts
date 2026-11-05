/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InventoryOwnerType } from './InventoryOwnerType';
import type { LowStockMaterialDto } from './LowStockMaterialDto';
import type { LowStockWarehouseDto } from './LowStockWarehouseDto';
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
