import type { PackageUnit } from '../generated/models/PackageUnit.d.ts';
import type { PackageUnitAvailableForDeliveryListDto } from '../generated/models/PackageUnitAvailableForDeliveryListDto.d.ts';
import { type PaginatedList } from './_base.d.ts';
export type { PackageUnit } from '../generated/models/PackageUnit.d.ts';
export type { PackageUnitAvailableForDeliveryListDto } from '../generated/models/PackageUnitAvailableForDeliveryListDto.d.ts';
export declare const packageUnitService: {
    availableForDelivery(params: PackageUnitAvailableForDeliveryListDto): Promise<PaginatedList<PackageUnit>>;
};
