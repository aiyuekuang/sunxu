import type { PurchaseSourcingResolvedItemDto } from './PurchaseSourcingResolvedItemDto.d.ts';
export type PurchaseSourcingGroupDto = {
    /**
     * 该供应商下可生成采购订单的明细
     */
    items: Array<PurchaseSourcingResolvedItemDto>;
    /**
     * 供应商ID
     */
    supplierId: string;
    /**
     * 供应商名称
     */
    supplierName: string;
};
