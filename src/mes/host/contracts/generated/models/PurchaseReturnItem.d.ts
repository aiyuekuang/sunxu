import type { Material } from './Material.d.ts';
import type { PurchaseOrderItem } from './PurchaseOrderItem.d.ts';
import type { PurchaseReceiptItem } from './PurchaseReceiptItem.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type PurchaseReturnItem = {
    amountSnapshot?: number | null;
    batchId?: string | null;
    batchNo?: string | null;
    createdAt: string;
    /**
     * 退货折扣金额快照
     */
    discountAmountSnapshot?: number | null;
    /**
     * 来源折扣率快照（%）
     */
    discountRateSnapshot?: number | null;
    /**
     * 退货折后未税金额快照
     */
    discountedAmountSnapshot?: number | null;
    id: string;
    location?: WarehouseLocation | null;
    locationId?: string | null;
    material?: Material;
    materialId: string;
    outboundQty: number;
    /**
     * 来源单价是否含税快照
     */
    priceIncludesTaxSnapshot?: boolean | null;
    purchaseOrderItem?: PurchaseOrderItem | null;
    purchaseOrderItemId?: string | null;
    remarks?: string | null;
    returnOrder?: Record<string, any>;
    returnOrderId: string;
    returnQty: number;
    sourceReceiptItem?: PurchaseReceiptItem | null;
    sourceReceiptItemId?: string | null;
    /**
     * 来源采购、收货、批次、价格快照
     */
    sourceSnapshot?: Record<string, any> | null;
    storageLocationSnapshot?: string | null;
    /**
     * 退货税额快照
     */
    taxAmountSnapshot?: number | null;
    /**
     * 来源税率快照（%）
     */
    taxRateSnapshot?: number | null;
    /**
     * 退货总金额快照（价税合计）
     */
    totalAmountSnapshot?: number | null;
    unitPriceSnapshot?: number | null;
    updatedAt: string;
};
