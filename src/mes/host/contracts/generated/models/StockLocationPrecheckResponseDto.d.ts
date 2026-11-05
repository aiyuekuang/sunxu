import type { WarehouseLocationControlMode } from './WarehouseLocationControlMode.d.ts';
export type StockLocationPrecheckResponseDto = {
    action: string;
    blockers: Array<string>;
    locationControlMode: WarehouseLocationControlMode;
    locationRequired: boolean;
    warehouseId: string;
    warnings: Array<string>;
};
