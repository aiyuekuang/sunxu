import type { ApprovalRecord } from './ApprovalRecord.d.ts';
export type ApprovalStepDetailDto = {
    /**
     * 审批人/角色/部门名
     */
    assigneeName?: string | null;
    /**
     * 当前登录用户是否是该步骤的审批人
     */
    isMyTurn?: boolean;
    /**
     * 步骤标签
     */
    label: string;
    /**
     * 审批记录（已审批时有值）
     */
    record?: ApprovalRecord | null;
    /**
     * 步骤状态
     */
    status: ApprovalStepDetailDto.status;
    /**
     * 步骤序号
     */
    step: number;
};
export declare namespace ApprovalStepDetailDto {
    /**
     * 步骤状态
     */
    enum status {
        APPROVED = "approved",
        REJECTED = "rejected",
        PENDING = "pending",
        WAITING = "waiting"
    }
}
