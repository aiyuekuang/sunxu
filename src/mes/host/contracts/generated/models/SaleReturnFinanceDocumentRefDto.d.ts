export type SaleReturnFinanceDocumentRefDto = {
    /**
     * 金额；无价格查看权限时为空
     */
    amount?: number | null;
    /**
     * 创建时间
     */
    createdAt: string;
    /**
     * 币种
     */
    currency?: string | null;
    /**
     * 财务单据ID
     */
    id: string;
    /**
     * 财务单据号
     */
    invoiceNo: string;
    /**
     * 来源类型：sale_return=客户贷项，sale_return_deduction=扣款应收
     */
    sourceType?: string | null;
    /**
     * 单据状态
     */
    status: SaleReturnFinanceDocumentRefDto.status;
    /**
     * 单据类型
     */
    type: SaleReturnFinanceDocumentRefDto.type;
};
export declare namespace SaleReturnFinanceDocumentRefDto {
    /**
     * 单据状态
     */
    enum status {
        CONFIRMED = "confirmed",
        PARTIAL = "partial",
        PAID = "paid",
        CANCELLED = "cancelled"
    }
    /**
     * 单据类型
     */
    enum type {
        RECEIVABLE = "receivable",
        PAYABLE = "payable"
    }
}
