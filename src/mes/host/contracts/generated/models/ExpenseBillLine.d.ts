export type ExpenseBillLine = {
    /**
     * 金额
     */
    amount: number;
    bill?: Record<string, any>;
    /**
     * 费用单ID
     */
    billId: string;
    /**
     * 收支类别ID
     */
    categoryId?: string | null;
    createdAt: string;
    /**
     * 费用说明
     */
    description?: string | null;
    id: string;
    /**
     * 行号
     */
    lineNo: number;
    /**
     * 行备注
     */
    remark?: string | null;
    /**
     * 关联采购来源单ID
     */
    sourceId?: string | null;
    /**
     * 关联采购来源单号快照
     */
    sourceNo?: string | null;
    /**
     * 关联采购来源单类型（可选，追溯采购运费/杂费所属采购单据）
     */
    sourceType?: ExpenseBillLine.sourceType | null;
    updatedAt: string;
};
export declare namespace ExpenseBillLine {
    /**
     * 关联采购来源单类型（可选，追溯采购运费/杂费所属采购单据）
     */
    enum sourceType {
        PURCHASE_RECEIPT = "purchase_receipt",
        PURCHASE_ORDER = "purchase_order"
    }
}
