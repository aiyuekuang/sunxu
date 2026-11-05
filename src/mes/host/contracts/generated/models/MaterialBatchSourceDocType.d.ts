/**
 * 批次来源类型：purchase_receipt=外部采购来料，work_order=内部完工入库
 */
export declare enum MaterialBatchSourceDocType {
    MANUAL = "manual",
    PURCHASE_RECEIPT = "purchase_receipt",
    WORK_ORDER = "work_order",
    STOCK_ADJUST = "stock_adjust",
    STOCK_TRANSFER = "stock_transfer",
    STOCK_RETURN = "stock_return",
    SALE_RETURN = "sale_return",
    STOCK_CONVERSION = "stock_conversion",
    OUTSOURCING_ORDER = "outsourcing_order"
}
