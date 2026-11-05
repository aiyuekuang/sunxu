import type { PurchaseReceiptSourcePreviewItemDto } from './PurchaseReceiptSourcePreviewItemDto.d.ts';
import type { PurchaseReceiptWarehouseRecommendationDto } from './PurchaseReceiptWarehouseRecommendationDto.d.ts';
import type { Supplier } from './Supplier.d.ts';
export type PurchaseReceiptSourcePreviewDto = {
    items: Array<PurchaseReceiptSourcePreviewItemDto>;
    /**
     * 来源采购订单号
     */
    orderNo: string;
    /**
     * 来源采购订单ID
     */
    purchaseOrderId: string;
    /**
     * 来源采购订单供应商
     */
    supplier: Supplier;
    /**
     * 供应商ID
     */
    supplierId: string;
    warehouseRecommendation: PurchaseReceiptWarehouseRecommendationDto;
};
