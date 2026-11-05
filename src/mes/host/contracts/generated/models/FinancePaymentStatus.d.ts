/**
 * 单据状态：active 有效 / cancelled 已撤销（撤销留档不删除，保持可追溯）
 */
export declare enum FinancePaymentStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled"
}
