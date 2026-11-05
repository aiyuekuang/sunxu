import type { PurchaseReceiptPriceDiffItemDto } from './PurchaseReceiptPriceDiffItemDto.d.ts';
export type PurchaseReceiptPriceSyncPreviewDto = {
    /**
     * 差异行数
     */
    diffCount: number;
    /**
     * 是否存在价格差异
     */
    hasDiff: boolean;
    /**
     * 差异明细
     */
    items: Array<PurchaseReceiptPriceDiffItemDto>;
    /**
     * 该公司是否配置了采购入库单审批流
     */
    requiresApproval: boolean;
};
