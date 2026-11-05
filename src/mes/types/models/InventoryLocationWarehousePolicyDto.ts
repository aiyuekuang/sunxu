/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WarehouseLocationControlMode } from './WarehouseLocationControlMode';
export type InventoryLocationWarehousePolicyDto = {
    /**
     * 仓库级仓位管控模式
     */
    mode: WarehouseLocationControlMode;
    /**
     * 该仓库库存动作是否必须选择结构化仓位
     */
    requireLocation: boolean;
    /**
     * 仓库ID
     */
    warehouseId: string;
    /**
     * 仓库名称
     */
    warehouseName: string;
};
