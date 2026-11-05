/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Equipment } from './Equipment';
import type { Tooling } from './Tooling';
import type { ToolingSessionStatus } from './ToolingSessionStatus';
import type { User } from './User';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type ToolingSessionListItemDto = {
    companyId: string;
    createdAt: string;
    /**
     * 结束时间
     */
    endTime?: string | null;
    endedAt?: string | null;
    equipment?: Equipment | null;
    equipmentId?: string | null;
    /**
     * 设备名称
     */
    equipmentName?: string | null;
    id: string;
    /**
     * 关联物料名称
     */
    materialName?: string | null;
    operator?: User;
    operatorId: string;
    /**
     * 操作员姓名
     */
    operatorName?: string | null;
    remark?: string | null;
    /**
     * 开始时间
     */
    startTime?: string | null;
    startedAt: string;
    status: ToolingSessionStatus;
    tooling?: Tooling;
    /**
     * 工装编号
     */
    toolingCode?: string | null;
    toolingId: string;
    /**
     * 工装名称
     */
    toolingName?: string | null;
    /**
     * 本次手工补录寿命消耗
     */
    usageCount?: number | null;
    /**
     * 实际使用位置
     */
    usageLocation?: string | null;
    useCount?: number | null;
    useHours?: number | null;
    /**
     * 关联工单号
     */
    workOrderNo?: string | null;
    workOrderOp?: WorkOrderOperation | null;
    workOrderOpId?: string | null;
    /**
     * 关联工序名称
     */
    workOrderOpName?: string | null;
};
