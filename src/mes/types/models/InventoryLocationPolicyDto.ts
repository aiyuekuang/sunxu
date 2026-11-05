/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InventoryLocationWarehousePolicyDto } from './InventoryLocationWarehousePolicyDto';
import type { WarehouseLocationControlMode } from './WarehouseLocationControlMode';
export type InventoryLocationPolicyDto = {
    /**
     * 未单独配置仓库时的默认管控模式
     */
    defaultMode: WarehouseLocationControlMode;
    /**
     * 公司级仓位管控功能是否可见/启用
     */
    featureEnabled: boolean;
    /**
     * 仓库级仓位管控摘要；仅功能启用时返回
     */
    warehouses: Array<InventoryLocationWarehousePolicyDto>;
};
