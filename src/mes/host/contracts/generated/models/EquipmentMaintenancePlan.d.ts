import type { Equipment } from './Equipment.d.ts';
import type { EquipmentMaintenanceTemplate } from './EquipmentMaintenanceTemplate.d.ts';
import type { MaintenanceGenerationMode } from './MaintenanceGenerationMode.d.ts';
import type { User } from './User.d.ts';
export type EquipmentMaintenancePlan = {
    /**
     * 首次计划日期
     */
    anchorDate: string;
    assignee?: User | null;
    assigneeId?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    equipment?: Equipment;
    equipmentId: string;
    generationMode: MaintenanceGenerationMode;
    id: string;
    /**
     * 重复间隔天数
     */
    intervalDays: number;
    isActive: boolean;
    /**
     * 保养模板
     */
    maintenanceTemplate?: EquipmentMaintenanceTemplate | null;
    /**
     * 保养模板ID
     */
    maintenanceTemplateId?: string | null;
    /**
     * 下一个待生成的计划日期
     */
    nextDueDate?: string | null;
    type: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
