/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PurchaseInquiryStrategyDto = {
    /**
     * 是否允许按行定标给不同供应商
     */
    allowPartialAward?: boolean;
    /**
     * 金额阈值；requiredRules 包含 amount 时生效
     */
    amountThreshold?: number;
    /**
     * 定标是否需要审批
     */
    approvalRequired?: boolean;
    /**
     * 命中强制询价时，未定标是否阻止采购订单确认
     */
    blockPoWithoutAward?: boolean;
    /**
     * 默认报价截止天数
     */
    defaultExpireDays?: number;
    /**
     * 定标前至少几家供应商报价
     */
    minQuoteCount?: number;
    /**
     * 强制询价预置规则列表
     */
    requiredRules?: Array<'amount' | 'new_material' | 'no_default_supplier' | 'multiple_suppliers'>;
    /**
     * 定标价回写物料供应商价格资料模式
     */
    updateMaterialSupplierPrice?: PurchaseInquiryStrategyDto.updateMaterialSupplierPrice;
};
export namespace PurchaseInquiryStrategyDto {
    /**
     * 定标价回写物料供应商价格资料模式
     */
    export enum updateMaterialSupplierPrice {
        NEVER = 'never',
        MANUAL = 'manual',
        AUTO = 'auto',
    }
}
