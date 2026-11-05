/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaterialIssueItem } from './MaterialIssueItem';
import type { MaterialIssueStatus } from './MaterialIssueStatus';
import type { MaterialIssueType } from './MaterialIssueType';
import type { User } from './User';
import type { WorkOrder } from './WorkOrder';
import type { WorkOrderOperation } from './WorkOrderOperation';
export type MaterialIssueOrder = {
    /**
     * 当前单据按状态机可执行的动作
     */
    availableActions?: Array<string>;
    companyId: string;
    /**
     * 确认日期；实际确认发料或退料完成时写入
     */
    confirmedAt?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    id: string;
    issueNo: string;
    items?: Array<MaterialIssueItem>;
    operation?: WorkOrderOperation | null;
    operationId?: string | null;
    operator?: User | null;
    operatorId?: string | null;
    /**
     * 计划发料时间；创建领料单时从工单计划开始时间冻结
     */
    plannedIssueAt?: string | null;
    remarks?: string | null;
    /**
     * 冲正业务日期
     */
    reversalBusinessDate?: string | null;
    /**
     * 冲正原因
     */
    reversalReason?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    status: MaterialIssueStatus;
    type: MaterialIssueType;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    workOrder?: WorkOrder;
    workOrderId: string;
};
