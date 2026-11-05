export type ExpenseBillAdvanceOffset = {
    /**
     * 被冲借款单ID
     */
    advanceId: string;
    /**
     * 被冲借款单号快照
     */
    advanceNo?: string | null;
    bill?: Record<string, any>;
    /**
     * 费用单ID
     */
    billId: string;
    createdAt: string;
    id: string;
    /**
     * 冲借款行号
     */
    lineNo: number;
    /**
     * 本次冲借款金额（正数）
     */
    offsetAmount: number;
    updatedAt: string;
};
