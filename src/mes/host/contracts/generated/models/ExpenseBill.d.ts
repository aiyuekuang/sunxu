import type { ExpenseBillAdvanceOffset } from './ExpenseBillAdvanceOffset.d.ts';
import type { ExpenseBillLine } from './ExpenseBillLine.d.ts';
import type { User } from './User.d.ts';
export type ExpenseBill = {
    advanceOffsets?: Array<ExpenseBillAdvanceOffset>;
    /**
     * 提交时冻结的审批步骤快照
     */
    approvalStepsSnapshot?: Record<string, any> | null;
    /**
     * 费用票据或说明附件引用
     */
    attachments?: Array<string>;
    /**
     * 当前费用单在当前数据范围内允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 费用单号（公司内唯一）
     */
    billNo: string;
    /**
     * 费用场景
     */
    billScene: ExpenseBill.billScene;
    /**
     * 业务日期
     */
    bizDate: string;
    companyId: string;
    /**
     * 往来对象ID
     */
    counterpartyId?: string | null;
    /**
     * 往来对象名称快照
     */
    counterpartyName?: string | null;
    /**
     * 往来对象类型
     */
    counterpartyType?: ExpenseBill.counterpartyType | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 币种
     */
    currency: string;
    id: string;
    lines?: Array<ExpenseBillLine>;
    /**
     * 付款时间
     */
    paidAt?: string | null;
    /**
     * 付款生成的资金流水ID
     */
    paidTransactionId?: string | null;
    /**
     * 付款账户ID
     */
    payAccountId?: string | null;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 状态
     */
    status: ExpenseBill.status;
    /**
     * 状态中文名称
     */
    statusLabel?: string;
    /**
     * 提交审批时间
     */
    submittedAt?: string | null;
    /**
     * 费用合计
     */
    totalAmount: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
export declare namespace ExpenseBill {
    /**
     * 费用场景
     */
    enum billScene {
        REIMBURSEMENT = "reimbursement",
        DIRECT = "direct",
        MONTHLY = "monthly"
    }
    /**
     * 往来对象类型
     */
    enum counterpartyType {
        EMPLOYEE = "employee",
        SUPPLIER = "supplier",
        CUSTOMER = "customer",
        OTHER = "other"
    }
    /**
     * 状态
     */
    enum status {
        DRAFT = "draft",
        SUBMITTED = "submitted",
        APPROVED = "approved",
        PAID = "paid",
        CANCELLED = "cancelled"
    }
}
