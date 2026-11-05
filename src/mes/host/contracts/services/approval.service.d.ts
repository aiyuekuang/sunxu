import type { ApprovalStatusResponseDto } from '../generated/models/ApprovalStatusResponseDto.d.ts';
import type { ApprovalResetResponseDto } from '../generated/models/ApprovalResetResponseDto.d.ts';
import type { ApprovalStepDto } from '../generated/models/ApprovalStepDto.d.ts';
import type { BatchHandleApprovalDto } from '../generated/models/BatchHandleApprovalDto.d.ts';
import type { BatchHandleApprovalResponseDto } from '../generated/models/BatchHandleApprovalResponseDto.d.ts';
export type { ApprovalRecord } from '../generated/models/ApprovalRecord.d.ts';
export type { BatchHandleApprovalResponseDto } from '../generated/models/BatchHandleApprovalResponseDto.d.ts';
import type { ApprovalRecord } from '../generated/models/ApprovalRecord.d.ts';
/** 审批流程每步详情 */
export interface ApprovalStepDetail {
    step: number;
    label: string;
    assigneeName: string | null;
    status: 'approved' | 'rejected' | 'pending' | 'waiting';
    record: ApprovalRecord | null;
}
/** 待审批列表项（手动定义，修正 openapi 生成的 submitterName 类型） */
export interface PendingApprovalItem {
    id: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    documentNo: string;
    currentStep: number;
    totalSteps: number;
    stepLabel: string;
    submitterName: string | null;
    submittedAt: string;
}
export declare const approvalService: {
    getStatus(entityType: string, entityId: string): Promise<ApprovalStatusResponseDto>;
    handle(entityType: string, entityId: string, action: "approved" | "rejected", comment?: string): Promise<ApprovalRecord>;
    batchHandle(dto: Omit<BatchHandleApprovalDto, "action"> & {
        action: "approved" | "rejected";
    }): Promise<BatchHandleApprovalResponseDto>;
    getHistory(entityType: string, entityId: string): Promise<ApprovalRecord[]>;
    configure(entityType: string, steps: ApprovalStepDto[], isActive?: boolean): Promise<import("../../../types/generated/index").ApprovalConfig>;
    getConfig(entityType: string): Promise<import("../../../types/generated/index").ApprovalConfig>;
    reset(entityType: string, entityId: string): Promise<ApprovalResetResponseDto>;
    /** 提交审批（进入审批流程），返回 true 表示需要审批 */
    submit(entityType: string, entityId: string): Promise<boolean>;
    /** 撤回审批（提交人在待审批阶段撤回） */
    recall(entityType: string, entityId: string): Promise<any>;
    /** 查询当前用户待审批列表 */
    pendingList(params: {
        page?: number;
        pageSize?: number;
        entityType?: string;
        orderBy?: string;
        orderDir?: "ASC" | "DESC";
    }): Promise<{
        list: PendingApprovalItem[];
        total: number;
        page: number;
        pageSize: number;
    }>;
};
