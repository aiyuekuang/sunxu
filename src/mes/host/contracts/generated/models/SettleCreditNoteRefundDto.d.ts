export type SettleCreditNoteRefundDto = {
    /**
     * 本次退款金额
     */
    amount: number;
    /**
     * 贷项通知 ID
     */
    creditNoteId: string;
    /**
     * 退款说明
     */
    description?: string;
    /**
     * 实际收付款资金账户 ID
     */
    fundsAccountId: string;
    /**
     * 退款日期
     */
    paymentDate?: string;
    /**
     * 收付款方式
     */
    paymentMethod?: string;
    /**
     * 银行流水号/支票号
     */
    referenceNo?: string;
};
