import type { EquipmentMaintenanceTemplate } from '../generated/models/EquipmentMaintenanceTemplate.d.ts';
import type { EquipmentMaintenanceTemplateListDto } from '../generated/models/EquipmentMaintenanceTemplateListDto.d.ts';
import { type PaginatedList } from './_base.d.ts';
export type { EquipmentMaintenanceTemplate } from '../generated/models/EquipmentMaintenanceTemplate.d.ts';
export declare const equipmentMaintenanceTemplateService: {
    list(params?: EquipmentMaintenanceTemplateListDto): Promise<PaginatedList<EquipmentMaintenanceTemplate>>;
    detail: (id: string) => import("../../../types/generated/index").Promise<EquipmentMaintenanceTemplate>;
};
