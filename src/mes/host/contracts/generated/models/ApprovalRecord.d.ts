import type { ApprovalAction } from './ApprovalAction.d.ts';
import type { User } from './User.d.ts';
export type ApprovalRecord = {
    /**
     * 审批动作
     */
    action: ApprovalAction;
    approver?: User;
    /**
     * 审批人 ID
     */
    approverId: string;
    /**
     * 审批人名（快照：记录审批时的用户名，防止用户改名后历史记录失真）
     */
    approverName?: string | null;
    /**
     * 仅用于批量请求恢复，不进入审批历史响应。
     */
    clientRequestId: string | null;
    /**
     * 审批意见
     */
    comment?: string | null;
    companyId: string;
    createdAt: string;
    /**
     * 关联实体 ID
     */
    entityId: string;
    /**
     * 关联实体类型，如 work_order, quality_inspection, disposal
     */
    entityType: string;
    id: string;
    /**
     * 审批步骤序号
     */
    step: number;
    updatedAt: string;
};
