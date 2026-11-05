import type { OutboundPurchaseReturnItemDto } from './OutboundPurchaseReturnItemDto.d.ts';
export type OutboundPurchaseReturnDto = {
    /**
     * 退库出库实际业务日期；不传默认当天，不能晚于当天
     */
    businessDate?: string;
    /**
     * ID
     */
    id: string;
    /**
     * 退库出库明细覆盖值；不传则按退货单明细默认出库
     */
    items?: Array<OutboundPurchaseReturnItemDto>;
    /**
     * 退款收款账户ID；财务动作为退款(refund)时必填
     */
    refundAccountId?: string;
    /**
     * 退款入账日期；不传默认取实际退库出库日期，不得早于实际退库出库日期或晚于当天
     */
    refundDate?: string;
};
