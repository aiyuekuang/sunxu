export type { WarehouseLocation } from '../generated/models/WarehouseLocation.d.ts';
export type { WarehouseLocationTreeNodeDto } from '../generated/models/WarehouseLocationTreeNodeDto.d.ts';
export type { WarehouseLocationTreeDto } from '../generated/models/WarehouseLocationTreeDto.d.ts';
export type { WarehouseLocationScanDto } from '../generated/models/WarehouseLocationScanDto.d.ts';
export type { WarehouseLocationRequiredCheckDto } from '../generated/models/WarehouseLocationRequiredCheckDto.d.ts';
export type { WarehouseLocationRequiredCheckResponseDto } from '../generated/models/WarehouseLocationRequiredCheckResponseDto.d.ts';
import type { WarehouseLocationTreeDto as WarehouseLocationTreeInputDto } from '../generated/models/WarehouseLocationTreeDto.d.ts';
import type { WarehouseLocationScanDto as WarehouseLocationScanInputDto } from '../generated/models/WarehouseLocationScanDto.d.ts';
import type { WarehouseLocationRequiredCheckDto as WarehouseLocationRequiredCheckInputDto } from '../generated/models/WarehouseLocationRequiredCheckDto.d.ts';
export declare const warehouseLocationService: {
    tree: (dto: WarehouseLocationTreeInputDto) => import("../../../types/generated/index").Promise<import("./warehouse-location.service.d.ts").WarehouseLocationTreeNodeDto[]>;
    scan: (dto: WarehouseLocationScanInputDto) => import("../../../types/generated/index").Promise<import("./warehouse-location.service.d.ts").WarehouseLocation>;
    enableRequiredCheck: (dto: WarehouseLocationRequiredCheckInputDto) => import("../../../types/generated/index").Promise<import("./warehouse-location.service.d.ts").WarehouseLocationRequiredCheckResponseDto>;
};
