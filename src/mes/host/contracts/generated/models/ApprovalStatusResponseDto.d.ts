import type { ApprovalRecord } from './ApprovalRecord.d.ts';
import type { ApprovalStepDetailDto } from './ApprovalStepDetailDto.d.ts';
export type ApprovalStatusResponseDto = {
    /**
     * 当前登录用户是否可撤回审批（仅提交人且未出现任何通过步骤时为 true）
     */
    canRecall?: boolean;
    /**
     * 当前步骤
     */
    currentStep: number;
    /**
     * 当前登录用户是否是当前待审步骤的审批人
     */
    isMyTurn?: boolean;
    /**
     * 审批记录列表
     */
    records: Array<ApprovalRecord>;
    /**
     * 审批状态
     */
    status: ApprovalStatusResponseDto.status;
    /**
     * 审批流程每步详情
     */
    steps: Array<ApprovalStepDetailDto>;
    /**
     * 总步骤数
     */
    totalSteps: number;
};
export declare namespace ApprovalStatusResponseDto {
    /**
     * 审批状态
     */
    enum status {
        PENDING_APPROVAL = "pending_approval",
        APPROVED = "approved",
        REJECTED = "rejected",
        CANCELLED = "cancelled",
        NONE = "none"
    }
}
