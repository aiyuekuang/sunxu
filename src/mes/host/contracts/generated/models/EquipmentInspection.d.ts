import type { Equipment } from './Equipment.d.ts';
import type { EquipmentFault } from './EquipmentFault.d.ts';
import type { EquipmentInspectionTask } from './EquipmentInspectionTask.d.ts';
import type { InspectionConclusion } from './InspectionConclusion.d.ts';
import type { User } from './User.d.ts';
export type EquipmentInspection = {
    companyId: string;
    conclusion: InspectionConclusion;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    equipment?: Equipment;
    equipmentId: string;
    /**
     * 由本次异常点检自动生成的故障单
     */
    fault?: EquipmentFault | null;
    id: string;
    inspectionDate: string;
    /**
     * 点检模板编码
     */
    inspectionTemplateCode?: string | null;
    /**
     * 点检模板ID
     */
    inspectionTemplateId?: string | null;
    /**
     * 点检模板名称
     */
    inspectionTemplateName?: string | null;
    /**
     * 点检模板版本
     */
    inspectionTemplateVersion?: number | null;
    inspector?: User | null;
    inspectorId?: string | null;
    /**
     * 是否在计划时间窗外完成
     */
    isLate: boolean;
    items: Array<string>;
    remarks?: string | null;
    task?: EquipmentInspectionTask | null;
    /**
     * 关联的应检任务
     */
    taskId?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
