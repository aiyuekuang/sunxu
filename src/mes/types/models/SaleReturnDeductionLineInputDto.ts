/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleReturnDeductionLineInputDto = {
    /**
     * 扣款金额（正数，单位元）
     */
    amount: number;
    /**
     * 计算依据
     */
    basis?: string;
    /**
     * 扣款项目（字典 deduction_item 的 itemValue）
     */
    deductionItemCode: string;
    /**
     * 扣款行备注
     */
    remarks?: string;
};
