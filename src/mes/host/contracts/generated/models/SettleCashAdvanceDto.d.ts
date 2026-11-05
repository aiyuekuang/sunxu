export type SettleCashAdvanceDto = {
    /**
     * 本次归还金额（正数）
     */
    amount: number;
    /**
     * ID
     */
    id: string;
    /**
     * 归还备注
     */
    remark?: string;
    /**
     * 收款账户ID
     */
    settleAccountId: string;
    /**
     * 归还日期
     */
    settleDate?: string;
};
