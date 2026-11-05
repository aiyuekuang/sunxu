import type { PurchaseLandedCost } from './PurchaseLandedCost.d.ts';
import type { PurchaseReceiptItem } from './PurchaseReceiptItem.d.ts';
export type PurchaseLandedCostAllocation = {
    /**
     * 会计来源单ID
     */
    accountingSourceDocumentId?: string | null;
    /**
     * 分摊金额；红字冲销为负数
     */
    allocatedAmount: number;
    /**
     * 本行分摊税额快照；红字冲销为负数，不进入存货成本
     */
    allocatedTaxAmount: number;
    /**
     * 本次分摊计算基数快照
     */
    allocationBase: number;
    /**
     * 批号快照
     */
    batchNoSnapshot?: string | null;
    companyId: string;
    createdAt: string;
    id: string;
    landedCost: PurchaseLandedCost;
    /**
     * 采购附加费用分摊单ID
     */
    landedCostId: string;
    /**
     * 物料ID快照
     */
    materialId: string;
    receiptItem?: PurchaseReceiptItem;
    /**
     * 采购入库单明细ID（唯一成本目标）
     */
    receiptItemId: string;
    /**
     * 采购入库单号快照
     */
    receiptNoSnapshot: string;
    /**
     * 采购入库单ID快照
     */
    receiptOrderId: string;
    /**
     * 实际入库基础数量快照
     */
    receiptQuantitySnapshot: number;
    updatedAt: string;
    /**
     * 仓库ID快照
     */
    warehouseId: string;
};
