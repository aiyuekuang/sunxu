export type PurchaseReceiptActualWarehouseSummary = {
  id: string;
  name: string;
};

export type PurchaseReceiptWarehouseListProjection = {
  actualWarehouses?: readonly PurchaseReceiptActualWarehouseSummary[];
  warehouseId?: string | null;
  warehouse?: { name?: string | null } | null;
  itemCount?: number | null;
};

export type PurchaseReceiptWarehouseDisplay = {
  label: string;
  detail?: string;
};

/**
 * 列表按明细实际入库仓展示。旧服务未返回聚合字段时才读取旧仓库摘要，
 * 避免把表头默认仓误展示成实际库存仓。
 */
export function getPurchaseReceiptWarehouseDisplay(
  receipt: PurchaseReceiptWarehouseListProjection,
): PurchaseReceiptWarehouseDisplay {
  if (Array.isArray(receipt.actualWarehouses)) {
    if (receipt.actualWarehouses.length === 1) {
      return { label: receipt.actualWarehouses[0].name };
    }
    if (receipt.actualWarehouses.length > 1) {
      return {
        label: `多仓（${receipt.actualWarehouses.length}）`,
        detail: receipt.actualWarehouses.map((warehouse) => warehouse.name).join('、'),
      };
    }
    return { label: '-' };
  }

  if (receipt.warehouse?.name) {
    return { label: receipt.warehouse.name };
  }
  if (!receipt.warehouseId && (receipt.itemCount ?? 0) > 0) {
    return { label: '多仓（明细）' };
  }
  return { label: '-' };
}
