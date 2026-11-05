import type { ConfirmCustomerMaterialDispositionDto } from '../generated/models/ConfirmCustomerMaterialDispositionDto.d.ts';
import type { CustomerMaterialDispositionAvailableSourceDto } from '../generated/models/CustomerMaterialDispositionAvailableSourceDto.d.ts';
import type { CustomerMaterialDispositionAvailableSourceListDto } from '../generated/models/CustomerMaterialDispositionAvailableSourceListDto.d.ts';
import type { CustomerMaterialDispositionOrder } from '../generated/models/CustomerMaterialDispositionOrder.d.ts';
import type { ReverseCustomerMaterialDispositionDto } from '../generated/models/ReverseCustomerMaterialDispositionDto.d.ts';
export type { CustomerMaterialDispositionAvailableSourceDto } from '../generated/models/CustomerMaterialDispositionAvailableSourceDto.d.ts';
export type { CustomerMaterialDispositionOrder } from '../generated/models/CustomerMaterialDispositionOrder.d.ts';
export type { ReverseCustomerMaterialDispositionDto } from '../generated/models/ReverseCustomerMaterialDispositionDto.d.ts';
export declare const customerMaterialDispositionService: {
    availableSources(params: CustomerMaterialDispositionAvailableSourceListDto): Promise<import("./_base.d.ts").PaginatedList<CustomerMaterialDispositionAvailableSourceDto>>;
    confirm(dto: ConfirmCustomerMaterialDispositionDto): Promise<CustomerMaterialDispositionOrder>;
    detail(id: string): Promise<CustomerMaterialDispositionOrder>;
    reverse(dto: ReverseCustomerMaterialDispositionDto): Promise<CustomerMaterialDispositionOrder>;
};
