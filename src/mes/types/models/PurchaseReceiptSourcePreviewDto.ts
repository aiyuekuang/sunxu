/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseReceiptSourcePreviewItemDto } from './PurchaseReceiptSourcePreviewItemDto';
import type { PurchaseReceiptWarehouseRecommendationDto } from './PurchaseReceiptWarehouseRecommendationDto';
import type { Supplier } from './Supplier';
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
