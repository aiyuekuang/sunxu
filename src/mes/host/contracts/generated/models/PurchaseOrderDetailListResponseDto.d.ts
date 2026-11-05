import type { PurchaseOrderDetailItemDto } from './PurchaseOrderDetailItemDto.d.ts';
import type { PurchaseOrderDetailSummaryDto } from './PurchaseOrderDetailSummaryDto.d.ts';
export type PurchaseOrderDetailListResponseDto = {
    list: Array<PurchaseOrderDetailItemDto>;
    /**
     * 页码
     */
    page: number;
    /**
     * 每页数量
     */
    pageSize: number;
    /**
     * 当前用户是否可见采购订单价格金额
     */
    priceVisible: boolean;
    summary: PurchaseOrderDetailSummaryDto;
    /**
     * 总条数
     */
    total: number;
};
