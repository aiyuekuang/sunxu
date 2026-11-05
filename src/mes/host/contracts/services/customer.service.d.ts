import type { Customer } from '../generated/models/Customer.d.ts';
import type { CustomerListDto } from '../generated/models/CustomerListDto.d.ts';
import type { CreateCustomerDto } from '../generated/models/CreateCustomerDto.d.ts';
import type { UpdateCustomerDto } from '../generated/models/UpdateCustomerDto.d.ts';
export type CustomerStatus = 'active' | 'inactive';
export type CustomerLevel = 'A' | 'B' | 'C' | 'D';
export type { Customer } from '../generated/models/Customer.d.ts';
export declare const customerService: {
    list: (params?: CustomerListDto | undefined) => Promise<import("./_base.d.ts").PaginatedList<Customer>>;
    detail: (id: string) => Promise<Customer>;
    create: (dto: CreateCustomerDto) => Promise<Customer>;
    update: (dto: UpdateCustomerDto) => Promise<Customer>;
    delete: (id: string) => Promise<unknown>;
};
