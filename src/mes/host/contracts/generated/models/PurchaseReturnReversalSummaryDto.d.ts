export type PurchaseReturnReversalSummaryDto = {
    /**
     * 冲正原因
     */
    reason: string;
    /**
     * 冲正时间
     */
    reversedAt: string;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    /**
     * 冲正人姓名
     */
    reverserName?: string | null;
};
