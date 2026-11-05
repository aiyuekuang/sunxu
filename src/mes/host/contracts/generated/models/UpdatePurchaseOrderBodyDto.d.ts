import type { PurchaseOrderItemDto } from './PurchaseOrderItemDto.d.ts';
export type UpdatePurchaseOrderBodyDto = {
    /**
     * 预计到货日期
     */
    expectedDate?: string;
    /**
     * 订单ID
     */
    id: string;
    items?: Array<PurchaseOrderItemDto>;
    /**
     * 付款条件
     */
    paymentTerms?: string;
    /**
     * 采购员ID
     */
    purchasingRepId?: string;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 供应商ID
     */
    supplierId?: string | null;
};
