/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ShiftCalendar } from './ShiftCalendar';
import type { User } from './User';
export type EquipmentInspectionPlan = {
    /**
     * 是否要求下班点检
     */
    afterShiftEnabled: boolean;
    /**
     * 下班点检允许在班次结束后的分钟数
     */
    afterShiftGraceMinutes: number;
    /**
     * 下班点检允许在班次结束前的分钟数
     */
    afterShiftLeadMinutes: number;
    /**
     * 是否要求上班点检
     */
    beforeShiftEnabled: boolean;
    /**
     * 上班点检允许在班次开始后的分钟数
     */
    beforeShiftGraceMinutes: number;
    /**
     * 上班点检允许在班次开始前的分钟数
     */
    beforeShiftLeadMinutes: number;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 适用设备类型
     */
    equipmentTypes: Array<string>;
    id: string;
    /**
     * 是否启用
     */
    isActive: boolean;
    shiftCalendar?: ShiftCalendar;
    shiftCalendarId: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
