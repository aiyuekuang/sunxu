export type ExpenseAdvanceOffsetInputDto = {
    /**
     * 被冲借款单ID
     */
    advanceId: string;
    /**
     * 本次冲借款金额（正数）
     */
    offsetAmount: number;
};
