/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { Tooling } from './Tooling';
import type { ToolingSessionStatus } from './ToolingSessionStatus';
import type { User } from './User';
import type { WorkOrderOperation } from './WorkOrderOperation';
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
