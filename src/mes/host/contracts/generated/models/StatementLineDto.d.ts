import type { StatementLineDocType } from './StatementLineDocType.d.ts';
export type StatementLineDto = {
    /**
     * 签名发生额：开单为正、贷项/收付款为负
     */
    amount: number;
    /**
     * 截至本行的滚动余额
     */
    balance: number;
    /**
     * 收付款业务类别（仅收付款行）
     */
    businessCategory?: string | null;
    /**
     * 发生日期
     */
    date?: string | null;
    /**
     * 单据/收付款 ID（供端侧钻取详情）
     */
    docId: string;
    /**
     * 单号
     */
    docNo: string;
    /**
     * 行类型：invoice 单据 / credit_note 贷项 / payment 收付款
     */
    docType: StatementLineDocType;
    /**
     * 到期日（仅单据行）
     */
    dueDate?: string | null;
    /**
     * 备注
     */
    memo?: string | null;
    /**
     * 收付方式（仅收付款行）
     */
    paymentMethod?: string | null;
    /**
     * 单据来源单号 / 收付款参考号
     */
    sourceNo?: string | null;
    /**
     * 单据状态（仅单据行）
     */
    status?: string | null;
};
