/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { SessionStatus } from './SessionStatus';
import type { ShiftCalendar } from './ShiftCalendar';
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type EquipmentSession = {
    actualDuration?: number | null;
    companyId: string;
    createdAt: string;
    endedAt?: string | null;
    equipment?: Equipment;
    equipmentId: string;
    id: string;
    operator?: User;
    operatorId: string;
    remark?: string | null;
    shiftCalendar?: ShiftCalendar | null;
    /**
     * 所属班次（关联 ShiftCalendar，用于 OEE 按班次统计）
     */
    shiftCalendarId?: string | null;
    startedAt: string;
    status: SessionStatus;
    updatedAt: string;
    workOrder?: WorkOrder | null;
    workOrderId?: string | null;
    workOrderOp?: WorkOrderOperation | null;
    workOrderOpId?: string | null;
};
