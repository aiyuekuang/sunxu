/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseReceiptWarehouseRecommendationStatus } from './PurchaseReceiptWarehouseRecommendationStatus';
import type { Warehouse } from './Warehouse';
export type PurchaseReceiptWarehouseRecommendationDto = {
    /**
     * 推荐结果说明
     */
    reason: string;
    /**
     * 默认仓推荐结果
     */
    status: PurchaseReceiptWarehouseRecommendationStatus;
    warehouse?: Warehouse | null;
    warehouseId?: string | null;
};
