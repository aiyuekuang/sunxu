import type { PreviewPurchaseReceiptPriceItemDto } from './PreviewPurchaseReceiptPriceItemDto.d.ts';
export type PreviewPurchaseReceiptPriceSyncDto = {
    /**
     * 用于比对的入库明细价格
     */
    items: Array<PreviewPurchaseReceiptPriceItemDto>;
    /**
     * 入库业务日期（用于匹配生效价）
     */
    receiptDate?: string;
    /**
     * 供应商ID
     */
    supplierId: string;
};
