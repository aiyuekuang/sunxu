import type { Equipment } from './Equipment.d.ts';
import type { EquipmentMaintenancePlan } from './EquipmentMaintenancePlan.d.ts';
import type { EquipmentMaintenanceTemplate } from './EquipmentMaintenanceTemplate.d.ts';
import type { MaintenanceGenerationMode } from './MaintenanceGenerationMode.d.ts';
import type { MaintenanceStatus } from './MaintenanceStatus.d.ts';
import type { User } from './User.d.ts';
export type EquipmentMaintenance = {
    assignee?: User | null;
    assigneeId?: string | null;
    /**
     * 负责人姓名
     */
    assigneeName?: string | null;
    /**
     * 当前状态允许的业务操作
     */
    availableActions?: Array<string>;
    companyId: string;
    completedDate?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 遗留兼容字段，仅历史维保数据回显使用
     * @deprecated
     */
    cycleInterval?: number | null;
    /**
     * 遗留兼容字段，仅历史维保数据回显使用
     * @deprecated
     */
    cycleType?: string | null;
    description?: string | null;
    equipment?: Equipment;
    equipmentId: string;
    /**
     * 设备名称
     */
    equipmentName?: string | null;
    generationMode?: MaintenanceGenerationMode | null;
    id: string;
    /**
     * 重复间隔天数
     */
    intervalDays?: number | null;
    maintenanceNo: string;
    /**
     * 保养模板
     */
    maintenanceTemplate?: EquipmentMaintenanceTemplate | null;
    /**
     * 保养模板编码
     */
    maintenanceTemplateCode?: string | null;
    /**
     * 保养模板ID
     */
    maintenanceTemplateId?: string | null;
    /**
     * 保养模板名称
     */
    maintenanceTemplateName?: string | null;
    /**
     * 保养模板版本
     */
    maintenanceTemplateVersion?: number | null;
    nextDueDate?: string | null;
    plan?: EquipmentMaintenancePlan | null;
    planId?: string | null;
    plannedDate: string;
    result?: string | null;
    status: MaintenanceStatus;
    /**
     * 状态颜色
     */
    statusColor?: string;
    /**
     * 状态中文
     */
    statusLabel?: string;
    /**
     * 保养步骤快照
     */
    steps?: Array<{
        content?: string | null;
        id?: string;
        name?: string;
        photoRequired?: boolean | null;
        photoUrls?: Array<string>;
        remark?: string | null;
        required?: boolean | null;
        result?: string | null;
    }>;
    type: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
