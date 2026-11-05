import type { PurchaseSourcingGroupDto } from './PurchaseSourcingGroupDto.d.ts';
import type { PurchaseSourcingUnresolvedItemDto } from './PurchaseSourcingUnresolvedItemDto.d.ts';
export type PurchaseSourcingPreviewDto = {
    /**
     * 按供应商分组结果
     */
    groups: Array<PurchaseSourcingGroupDto>;
    /**
     * 预计生成采购订单数
     */
    orderCount: number;
    /**
     * 已确定供应商明细数
     */
    resolvedCount: number;
    /**
     * 本次选中明细数
     */
    totalSelected: number;
    /**
     * 未确定供应商明细数
     */
    unresolvedCount: number;
    /**
     * 未确定供应商的明细
     */
    unresolvedItems: Array<PurchaseSourcingUnresolvedItemDto>;
};
