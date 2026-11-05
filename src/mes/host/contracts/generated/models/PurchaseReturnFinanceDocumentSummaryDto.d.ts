export type PurchaseReturnFinanceDocumentSummaryDto = {
    /**
     * 金额；无价格查看权限时为空
     */
    amount?: number | null;
    /**
     * 币别
     */
    currency?: string | null;
    /**
     * 财务单据号
     */
    documentNo: string;
    /**
     * 汇率
     */
    exchangeRate?: number | null;
    /**
     * 财务单据ID
     */
    id: string;
    /**
     * 状态
     */
    status: string;
};
