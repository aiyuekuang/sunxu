import type { SaleReturnDeductionLineInputDto } from './SaleReturnDeductionLineInputDto.d.ts';
import type { SaleReturnItemInputDto } from './SaleReturnItemInputDto.d.ts';
export type CreateSaleReturnDto = {
    /**
     * 客户ID；无来源客户退回时必填
     */
    customerId?: string;
    /**
     * 扣款明细（协商扣款，可选；不传或空数组=无扣款）
     */
    deductionLines?: Array<SaleReturnDeductionLineInputDto>;
    /**
     * 财务处理；选择生成客户贷项时传入，普通实物退货不传
     */
    financialAction?: CreateSaleReturnDto.financialAction;
    /**
     * 是否需要质检
     */
    inspectionRequired?: boolean;
    /**
     * 退货明细
     */
    items: Array<SaleReturnItemInputDto>;
    /**
     * 退货原因字典值
     */
    reasonCode?: string;
    /**
     * 退回仓库ID；不传默认使用来源出库仓库
     */
    receiveWarehouseId?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 退货类型
     */
    returnType?: CreateSaleReturnDto.returnType;
    /**
     * 来源销售出库单ID；无来源客户退回时不传
     */
    sourceDeliveryId?: string;
};
export declare namespace CreateSaleReturnDto {
    /**
     * 财务处理；选择生成客户贷项时传入，普通实物退货不传
     */
    enum financialAction {
        NONE = "none",
        CREDIT_NOTE = "credit_note",
        RECEIVABLE_OFFSET = "receivable_offset",
        REFUND = "refund"
    }
    /**
     * 退货类型
     */
    enum returnType {
        PHYSICAL_RETURN = "physical_return",
        REFUND_ONLY = "refund_only",
        EXCHANGE_RETURN = "exchange_return"
    }
}
