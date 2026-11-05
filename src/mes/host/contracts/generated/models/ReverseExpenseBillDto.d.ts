export type ReverseExpenseBillDto = {
    /**
     * ID
     */
    id: string;
    /**
     * 冲正原因
     */
    reason?: string;
    /**
     * 冲正日期
     */
    reverseDate?: string;
};
