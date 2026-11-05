import type { Supplier } from '../generated/models/Supplier.d.ts';
import type { SupplierListDto } from '../generated/models/SupplierListDto.d.ts';
import type { CreateSupplierDto } from '../generated/models/CreateSupplierDto.d.ts';
import type { UpdateSupplierDto } from '../generated/models/UpdateSupplierDto.d.ts';
export type SupplierStatus = 'active' | 'inactive';
export type SupplierRating = 'A' | 'B' | 'C' | 'D';
export type { Supplier } from '../generated/models/Supplier.d.ts';
export declare const supplierService: {
    list: (params?: SupplierListDto | undefined) => Promise<import("./_base.d.ts").PaginatedList<Supplier>>;
    detail: (id: string) => Promise<Supplier>;
    create: (dto: CreateSupplierDto) => Promise<Supplier>;
    update: (dto: UpdateSupplierDto) => Promise<Supplier>;
    delete: (id: string) => Promise<unknown>;
};
