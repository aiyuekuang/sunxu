import type { User } from './User.d.ts';
export type CashAdvance = {
    /**
     * 借支单号（公司内唯一）
     */
    advanceNo: string;
    /**
     * 借支金额
     */
    amount: number;
    /**
     * 提交时冻结的审批步骤快照
     */
    approvalStepsSnapshot?: Record<string, any> | null;
    /**
     * 当前借支单在当前数据范围内允许的业务操作
     */
    availableActions?: Array<string>;
    /**
     * 业务日期
     */
    bizDate: string;
    companyId: string;
    /**
     * 借支对象ID（员工等；自由往来对象为空）
     */
    counterpartyId?: string | null;
    /**
     * 借支对象名称快照
     */
    counterpartyName?: string | null;
    /**
     * 借支对象类型
     */
    counterpartyType: CashAdvance.counterpartyType;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 币种
     */
    currency: string;
    /**
     * 借出账户ID
     */
    disburseAccountId?: string | null;
    /**
     * 借出生成的资金流水ID
     */
    disburseTransactionId?: string | null;
    id: string;
    /**
     * 借支事由
     */
    reason?: string | null;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 已归还/核销金额
     */
    settledAmount: number;
    /**
     * 状态
     */
    status: CashAdvance.status;
    /**
     * 状态中文名称
     */
    statusLabel?: string;
    /**
     * 提交审批时间
     */
    submittedAt?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
export declare namespace CashAdvance {
    /**
     * 借支对象类型
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
        DISBURSED = "disbursed",
        PARTIALLY_SETTLED = "partially_settled",
        SETTLED = "settled",
        CANCELLED = "cancelled"
    }
}
