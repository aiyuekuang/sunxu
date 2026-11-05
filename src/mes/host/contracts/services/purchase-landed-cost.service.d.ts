import type { PurchaseLandedCost } from '../generated/models/PurchaseLandedCost.d.ts';
export type { PurchaseLandedCost };
/**
 * 采购附加费用分摊单在移动端只读承接采购入库详情。
 * 写入、确认与冲销统一留在 PC 端的分摊单主流程，避免移动端形成第二个成本入口。
 */
export declare const purchaseLandedCostService: {
    listByReceipt(receiptOrderId: string): Promise<PurchaseLandedCost[]>;
};
