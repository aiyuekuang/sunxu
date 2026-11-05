import type { ExpenseAdvanceOffsetInputDto } from './ExpenseAdvanceOffsetInputDto.d.ts';
import type { ExpenseBillLineDto } from './ExpenseBillLineDto.d.ts';
export type CreateExpenseBillDto = {
    /**
     * 冲借款明细（报销冲借款，可选；可冲多张借款）
     */
    advanceOffsets?: Array<ExpenseAdvanceOffsetInputDto>;
    /**
     * 费用票据或说明附件引用
     */
    attachments?: Array<string>;
    /**
     * 费用场景
     */
    billScene: CreateExpenseBillDto.billScene;
    /**
     * 业务日期
     */
    bizDate: string;
    /**
     * 往来对象ID
     */
    counterpartyId?: string;
    /**
     * 往来对象名称
     */
    counterpartyName?: string;
    /**
     * 往来对象类型
     */
    counterpartyType?: CreateExpenseBillDto.counterpartyType;
    /**
     * 币种（留空取公司本位币）
     */
    currency?: string;
    lines: Array<ExpenseBillLineDto>;
    /**
     * 备注
     */
    remark?: string;
};
export declare namespace CreateExpenseBillDto {
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
}
