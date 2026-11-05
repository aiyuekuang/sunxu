import type { PurchaseReturnDeductionLineInputDto } from './PurchaseReturnDeductionLineInputDto.d.ts';
import type { PurchaseReturnItemInputDto } from './PurchaseReturnItemInputDto.d.ts';
export type CreatePurchaseReturnDto = {
    /**
     * 扣款明细（协商扣款，可选；不传或空数组=无扣款）
     */
    deductionLines?: Array<PurchaseReturnDeductionLineInputDto>;
    /**
     * 财务动作；不传默认冲减应付。选择不处理财务时，不生成应付冲减或退款记录
     */
    financialAction?: CreatePurchaseReturnDto.financialAction;
    /**
     * 是否需要质检
     */
    inspectionRequired?: boolean;
    /**
     * 退货明细
     */
    items: Array<PurchaseReturnItemInputDto>;
    /**
     * 退库出库仓库ID；独立退料时必填，从采购入库单下推时默认使用来源入库仓库
     */
    outboundWarehouseId?: string;
    /**
     * 退货原因字典值
     */
    reasonCode?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 退货日期
     */
    returnDate?: string;
    /**
     * 退货类型
     */
    returnType?: CreatePurchaseReturnDto.returnType;
    /**
     * 来源采购订单ID；不传时从采购入库单带出，独立退料时仅作追溯
     */
    sourcePurchaseOrderId?: string;
    /**
     * 来源采购入库单ID；不传时按现存库存独立退料
     */
    sourceReceiptId?: string;
    /**
     * 供应商ID；按现存库存退料时必填，从采购入库单下推时由来源单带出
     */
    supplierId?: string;
};
export declare namespace CreatePurchaseReturnDto {
    /**
     * 财务动作；不传默认冲减应付。选择不处理财务时，不生成应付冲减或退款记录
     */
    enum financialAction {
        NONE = "none",
        PAYABLE_OFFSET = "payable_offset",
        REFUND = "refund"
    }
    /**
     * 退货类型
     */
    enum returnType {
        PHYSICAL_RETURN = "physical_return",
        REFUND_ONLY = "refund_only"
    }
}
