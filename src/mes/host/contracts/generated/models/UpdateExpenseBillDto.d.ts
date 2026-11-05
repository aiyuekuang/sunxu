import type { ExpenseAdvanceOffsetInputDto } from './ExpenseAdvanceOffsetInputDto.d.ts';
import type { ExpenseBillLineDto } from './ExpenseBillLineDto.d.ts';
export type UpdateExpenseBillDto = {
    /**
     * 冲借款明细；传入则整组替换,传空数组清空
     */
    advanceOffsets?: Array<ExpenseAdvanceOffsetInputDto>;
    /**
     * 费用票据或说明附件引用
     */
    attachments?: Array<string>;
    /**
     * 费用场景
     */
    billScene?: UpdateExpenseBillDto.billScene;
    /**
     * 业务日期
     */
    bizDate?: string;
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
    counterpartyType?: UpdateExpenseBillDto.counterpartyType;
    /**
     * 币种
     */
    currency?: string;
    /**
     * ID
     */
    id: string;
    lines?: Array<ExpenseBillLineDto>;
    /**
     * 备注
     */
    remark?: string;
};
export declare namespace UpdateExpenseBillDto {
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
