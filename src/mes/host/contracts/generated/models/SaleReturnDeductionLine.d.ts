export type SaleReturnDeductionLine = {
    /**
     * 扣款金额（正数，单位元）
     */
    amount: number;
    /**
     * 计算依据（如：专用材料不可回用 / 已投入人工机加工成本）
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
     * 销售退货单ID
     */
    returnOrderId: string;
    updatedAt: string;
};
