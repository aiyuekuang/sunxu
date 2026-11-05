import type { InspectionTemplateItemDto } from './InspectionTemplateItemDto.d.ts';
export type UpdateEquipmentDto = {
    description?: string;
    /**
     * 设备类型（字典：equipment_type）
     */
    equipmentType?: string;
    id: string;
    inspectionTemplate?: Array<InspectionTemplateItemDto>;
    /**
     * 设备点检模板ID
     */
    inspectionTemplateId?: string;
    /**
     * 维保供应商ID
     */
    maintSupplierId?: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    purchaseDate?: string;
    purchasePrice?: number;
    responsibleUserId?: string;
    serialNo?: string;
    warrantyExpiry?: string;
    workCenterId?: string;
};
