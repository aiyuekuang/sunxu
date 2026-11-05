import type { MaintenanceGenerationMode } from './MaintenanceGenerationMode.d.ts';
export type CreateMaintenanceDto = {
    assigneeId?: string;
    description?: string;
    equipmentId: string;
    /**
     * 重复生成方式
     */
    generationMode?: MaintenanceGenerationMode;
    /**
     * 重复间隔天数
     */
    intervalDays?: number;
    /**
     * 保养模板ID
     */
    maintenanceTemplateId?: string;
    plannedDate: string;
    type?: string;
};
