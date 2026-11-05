import type { Equipment } from './Equipment.d.ts';
import type { SessionStatus } from './SessionStatus.d.ts';
import type { ShiftCalendar } from './ShiftCalendar.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrder } from './WorkOrder.d.ts';
import type { WorkOrderOperation } from './WorkOrderOperation.d.ts';
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
