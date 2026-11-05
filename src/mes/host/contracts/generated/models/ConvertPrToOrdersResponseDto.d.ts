import type { ConvertedPurchaseOrderDto } from './ConvertedPurchaseOrderDto.d.ts';
import type { PurchaseSourcingUnresolvedItemDto } from './PurchaseSourcingUnresolvedItemDto.d.ts';
export type ConvertPrToOrdersResponseDto = {
    /**
     * 已生成采购订单数量
     */
    orderCount: number;
    /**
     * 已生成的采购订单
     */
    orders: Array<ConvertedPurchaseOrderDto>;
    /**
     * 待处理明细数量
     */
    unresolvedCount: number;
    /**
     * 未生成采购订单的待处理明细
     */
    unresolvedItems: Array<PurchaseSourcingUnresolvedItemDto>;
};
