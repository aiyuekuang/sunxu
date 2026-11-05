import type { InspectionTemplateItemDto } from './InspectionTemplateItemDto.d.ts';
export type CreateEquipmentDto = {
    code?: string;
    description?: string;
    /**
     * 设备类型（字典：equipment_type）
     */
    equipmentType?: string;
    inspectionTemplate?: Array<InspectionTemplateItemDto>;
    /**
     * 设备点检模板ID
     */
    inspectionTemplateId?: string;
    /**
     * 维保供应商ID
     */
    maintSupplierId?: string;
    /**
     * 设备厂商（字典：equipment_manufacturer）
     */
    manufacturer?: string;
    model?: string;
    name: string;
    purchaseDate?: string;
    purchasePrice?: number;
    responsibleUserId?: string;
    serialNo?: string;
    warrantyExpiry?: string;
    /**
     * 所属工作中心ID（叶子节点）
     */
    workCenterId?: string;
};
