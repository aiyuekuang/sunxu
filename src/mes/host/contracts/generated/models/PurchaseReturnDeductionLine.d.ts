export type PurchaseReturnDeductionLine = {
    /**
     * 扣款金额（正数，单位元）
     */
    amount: number;
    /**
     * 计算依据
     */
    basis?: string | null;
    createdAt: string;
    /**
     * 扣款项目（字典 deduction_item 的 itemValue）
     */
    deductionItemCode: string;
    id: string;
    /**
     * 扣款行号
     */
    lineNo: number;
    /**
     * 扣款行备注
     */
    remarks?: string | null;
    returnOrder?: Record<string, any>;
    /**
     * 采购退料单ID
     */
    returnOrderId: string;
    updatedAt: string;
};
