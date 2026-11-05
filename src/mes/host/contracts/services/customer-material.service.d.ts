import { CustomerMaterialsService } from '../generated/services/CustomerMaterialsService.d.ts';
import type { CustomerMaterialListDto } from '../generated/models/CustomerMaterialListDto.d.ts';
export { CustomerMaterialsService };
export type { CreateCustomerMaterialDto } from '../generated/models/CreateCustomerMaterialDto.d.ts';
export type { CustomerMaterial } from '../generated/models/CustomerMaterial.d.ts';
export type { CustomerMaterialListDto } from '../generated/models/CustomerMaterialListDto.d.ts';
export type { FindEffectiveCustomerMaterialDto } from '../generated/models/FindEffectiveCustomerMaterialDto.d.ts';
export type { UpdateCustomerMaterialDto } from '../generated/models/UpdateCustomerMaterialDto.d.ts';
export declare const customerMaterialService: {
    list: (params?: CustomerMaterialListDto) => import("../../../types/generated/index").Promise<import("./customer-material.service.d.ts").CustomerMaterial[]>;
    findEffective: typeof CustomerMaterialsService.customerMaterialControllerFindEffective;
    create: typeof CustomerMaterialsService.customerMaterialControllerCreate;
    update: typeof CustomerMaterialsService.customerMaterialControllerUpdate;
    delete: (id: string) => Promise<void>;
};
