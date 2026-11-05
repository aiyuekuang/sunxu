export type PayExpenseBillDto = {
    /**
     * ID
     */
    id: string;
    /**
     * 付款账户ID
     */
    payAccountId: string;
    /**
     * 付款日期
     */
    payDate?: string;
    /**
     * 付款备注
     */
    remark?: string;
};
