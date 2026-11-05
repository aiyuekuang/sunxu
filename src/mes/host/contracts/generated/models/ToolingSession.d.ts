import type { Equipment } from './Equipment.d.ts';
import type { Tooling } from './Tooling.d.ts';
import type { ToolingSessionStatus } from './ToolingSessionStatus.d.ts';
import type { User } from './User.d.ts';
import type { WorkOrderOperation } from './WorkOrderOperation.d.ts';
export type ToolingSession = {
    companyId: string;
    createdAt: string;
    endedAt?: string | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    id: string;
    operator?: User;
    operatorId: string;
    remark?: string | null;
    startedAt: string;
    status: ToolingSessionStatus;
    tooling?: Tooling;
    toolingId: string;
    /**
     * 实际使用位置
     */
    usageLocation?: string | null;
    useCount?: number | null;
    useHours?: number | null;
    workOrderOp?: WorkOrderOperation | null;
    workOrderOpId?: string | null;
};
