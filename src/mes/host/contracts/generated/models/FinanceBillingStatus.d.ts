/**
 * 开票状态快照；权威来源优先为完整财务 ERP 税票台账
 */
export declare enum FinanceBillingStatus {
    NOT_BILLED = "not_billed",
    PARTIAL_BILLED = "partial_billed",
    BILLED = "billed",
    NOT_REQUIRED = "not_required"
}
