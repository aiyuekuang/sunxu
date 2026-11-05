export type ReversePurchaseReceiptDto = {
    /**
     * 冲正实际执行日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
};
