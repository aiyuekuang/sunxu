import type { Material } from './Material.d.ts';
import type { SaleDeliveryItem } from './SaleDeliveryItem.d.ts';
import type { SaleOrderItem } from './SaleOrderItem.d.ts';
import type { SaleReturnDisposition } from './SaleReturnDisposition.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type SaleReturnItem = {
    acceptedQty: number;
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
    disposition: SaleReturnDisposition;
    financialAction?: SaleReturnItem.financialAction | null;
    id: string;
    location?: WarehouseLocation | null;
    locationId?: string | null;
    material?: Material;
    materialId: string;
    /**
     * 来源单价是否含税快照
     */
    priceIncludesTaxSnapshot?: boolean | null;
    receivedQty: number;
    rejectedQty: number;
    remarks?: string | null;
    returnOrder?: Record<string, any>;
    returnOrderId: string;
    returnQty: number;
    saleOrderItem?: SaleOrderItem | null;
    saleOrderItemId?: string | null;
    sourceDeliveryItem?: SaleDeliveryItem | null;
    sourceDeliveryItemId?: string | null;
    /**
     * 来源销售、出库、批次、价格快照
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
export declare namespace SaleReturnItem {
    enum financialAction {
        NONE = "none",
        CREDIT_NOTE = "credit_note",
        RECEIVABLE_OFFSET = "receivable_offset",
        REFUND = "refund"
    }
}
