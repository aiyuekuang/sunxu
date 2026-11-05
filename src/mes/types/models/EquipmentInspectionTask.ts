/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { EquipmentInspection } from './EquipmentInspection';
import type { EquipmentInspectionPlan } from './EquipmentInspectionPlan';
import type { ShiftCalendar } from './ShiftCalendar';
import type { User } from './User';
export type EquipmentInspectionTask = {
    /**
     * 当前是否可以执行；逾期的上班点检仅在当前班次内、设备可用时允许补做
     */
    canExecute?: boolean;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    equipment?: Equipment;
    equipmentId: string;
    id: string;
    inspection?: EquipmentInspection | null;
    inspectionDate: string;
    /**
     * 任务是否已超过原计划时间窗
     */
    isLate?: boolean;
    /**
     * 点检项目标准快照
     */
    items: Array<Record<string, any>>;
    plan?: EquipmentInspectionPlan;
    planId: string;
    shiftCalendar?: ShiftCalendar;
    shiftCalendarId: string;
    stage: EquipmentInspectionTask.stage;
    status: EquipmentInspectionTask.status;
    templateCode?: string | null;
    templateId?: string | null;
    templateName?: string | null;
    templateVersion?: number | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    windowEndsAt: string;
    windowStartsAt: string;
};
export namespace EquipmentInspectionTask {
    export enum stage {
        BEFORE_SHIFT = 'before_shift',
        AFTER_SHIFT = 'after_shift',
    }
    export enum status {
        PENDING = 'pending',
        COMPLETED = 'completed',
        CANCELLED = 'cancelled',
        SUSPENDED = 'suspended',
        SKIPPED = 'skipped',
        OVERDUE = 'overdue',
    }
}
