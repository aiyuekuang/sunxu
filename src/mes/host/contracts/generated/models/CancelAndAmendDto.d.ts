export type CancelAndAmendDto = {
    /**
     * 要取消修正的质检单ID
     */
    id: string;
    /**
     * 取消原因（必填）
     */
    reason: string;
};
