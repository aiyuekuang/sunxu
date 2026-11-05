import type { PurchaseReturnFromReceiptItemDto } from './PurchaseReturnFromReceiptItemDto.d.ts';
export type PurchaseReturnFromReceiptDto = {
    /**
     * 财务动作；不传默认冲减应付。选择不处理财务时，不生成应付冲减或退款记录
     */
    financialAction?: PurchaseReturnFromReceiptDto.financialAction;
    /**
     * 逐行退货数量；不传则默认按全部可退数量创建草稿。传入时按行覆盖：数量为 0 或省略的行不进入退货单，每行不得超过该行可退数量；批次/仓位仍以来源入库行为准。
     */
    items?: Array<PurchaseReturnFromReceiptItemDto>;
    /**
     * 退货原因字典值
     */
    reasonCode: string;
    /**
     * 退货日期；不传默认当天
     */
    returnDate?: string;
    /**
     * 来源采购入库单ID
     */
    sourceReceiptId: string;
};
export declare namespace PurchaseReturnFromReceiptDto {
    /**
     * 财务动作；不传默认冲减应付。选择不处理财务时，不生成应付冲减或退款记录
     */
    enum financialAction {
        NONE = "none",
        PAYABLE_OFFSET = "payable_offset",
        REFUND = "refund"
    }
}
