/**
 * Core 收付款业务类别（受限）；出纳类业务归属完整财务 ERP
 */
export declare enum FinancePaymentBusinessCategory {
    CUSTOMER_RECEIPT = "customer_receipt",
    SUPPLIER_PAYMENT = "supplier_payment",
    ADVANCE_RECEIPT = "advance_receipt",
    ADVANCE_PAYMENT = "advance_payment",
    WRITE_OFF_DIFFERENCE = "write_off_difference",
    BUSINESS_DISCOUNT = "business_discount",
    CUSTOMER_REFUND_PAYMENT = "customer_refund_payment",
    SUPPLIER_REFUND_RECEIPT = "supplier_refund_receipt"
}
