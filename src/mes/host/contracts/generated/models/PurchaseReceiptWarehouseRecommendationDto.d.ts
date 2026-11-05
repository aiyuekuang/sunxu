import type { PurchaseReceiptWarehouseRecommendationStatus } from './PurchaseReceiptWarehouseRecommendationStatus.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
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
