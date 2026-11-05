import type { PurchaseReceiptSourcePreviewItemDto } from '../../../types/models/PurchaseReceiptSourcePreviewItemDto';
import type { Warehouse } from '../../../host/services';
import type { SelectedStockLocation } from '../../warehouse/components/StockLocationField.tsx';
import {
  getEffectiveMaterialShelfLifeDays,
  requiresMaterialBatchNo,
} from '../../../utils/material-batch-requirement';

export interface PurchaseOrderReceiveDraft {
  key: string;
  source: PurchaseReceiptSourcePreviewItemDto;
  /** 本次实际到货数量，使用本行收货单位。 */
  arrivalReceiptQty: string;
  rejectedReceiptQty: string;
  batchNo: string;
  productionDate: string;
  expiryDate: string;
  supplierBatchNo: string;
  rejectReason: string;
  remarks: string;
  /** 明细实际入库仓；库存、批次与仓位均以此为准。 */
  warehouse: Warehouse | null;
  /** 当前行仓库来源；表头仓或物料默认仓可继续被表头统一调整。 */
  warehouseSource?: 'header' | 'sourceDefault' | 'manual';
  location: SelectedStockLocation | null;
  storageLocation: string;
  grade?: string;
}

const RECEIPT_QTY_EPSILON = 0.0001;

export function getSuggestedArrivalReceiptQty(
  receivableReceiptQty: number | null | undefined,
): string {
  const quantity = Number(receivableReceiptQty ?? 0);
  return Number.isFinite(quantity) && quantity > 0 ? String(quantity) : '';
}

export function createPurchaseOrderReceiveItemKey(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `app-purchase-receive-item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

export function createPurchaseOrderReceiveDraft(
  source: PurchaseReceiptSourcePreviewItemDto,
  defaultWarehouse: Warehouse | null = null,
): PurchaseOrderReceiveDraft {
  const resolvedWarehouse = defaultWarehouse ?? source.defaultWarehouse ?? null;
  return {
    key: source.purchaseOrderItem.id,
    source,
    arrivalReceiptQty: getSuggestedArrivalReceiptQty(source.receivableReceiptQty),
    rejectedReceiptQty: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    supplierBatchNo: '',
    rejectReason: '',
    remarks: '',
    warehouse: resolvedWarehouse,
    warehouseSource: defaultWarehouse ? 'header' : resolvedWarehouse ? 'sourceDefault' : undefined,
    location: null,
    storageLocation: '',
    grade: source.purchaseOrderItem.grade ?? undefined,
  };
}

export function createSplitPurchaseOrderReceiveDraft(
  draft: PurchaseOrderReceiveDraft,
): PurchaseOrderReceiveDraft {
  return {
    ...draft,
    key: createPurchaseOrderReceiveItemKey(),
    arrivalReceiptQty: '',
    rejectedReceiptQty: '',
    batchNo: '',
    productionDate: '',
    expiryDate: '',
    supplierBatchNo: '',
    rejectReason: '',
    remarks: '',
    location: null,
    storageLocation: '',
  };
}

export function parsePurchaseOrderReceiveQty(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? 0 : Number(trimmed);
}

export function getPurchaseOrderReceiveAllocation(draft: PurchaseOrderReceiveDraft): number {
  return parsePurchaseOrderReceiveQty(draft.arrivalReceiptQty);
}

export function getPurchaseOrderReceiveAllocations(
  drafts: readonly PurchaseOrderReceiveDraft[],
): Map<string, number> {
  const allocations = new Map<string, number>();
  for (const draft of drafts) {
    const sourceId = draft.source.purchaseOrderItem.id;
    allocations.set(
      sourceId,
      (allocations.get(sourceId) ?? 0) + getPurchaseOrderReceiveAllocation(draft),
    );
  }
  return allocations;
}

export function validatePurchaseOrderReceiveDrafts(
  drafts: readonly PurchaseOrderReceiveDraft[],
): string | null {
  let hasAction = false;
  const allocations = new Map<string, number>();
  for (const [index, draft] of drafts.entries()) {
    const arrivalReceiptQty = parsePurchaseOrderReceiveQty(draft.arrivalReceiptQty);
    const rejectedReceiptQty = parsePurchaseOrderReceiveQty(draft.rejectedReceiptQty);
    const lineLabel = `第 ${index + 1} 行`;

    if (
      !Number.isFinite(arrivalReceiptQty) ||
      !Number.isFinite(rejectedReceiptQty) ||
      arrivalReceiptQty < 0 ||
      rejectedReceiptQty < 0
    ) {
      return `${lineLabel}请输入有效的实际到货或拒收数量`;
    }
    if (rejectedReceiptQty - arrivalReceiptQty > RECEIPT_QTY_EPSILON) {
      return `${lineLabel}拒收数量不能超过本次实际到货数量`;
    }
    if (arrivalReceiptQty > 0) {
      hasAction = true;
    }
    const sourceId = draft.source.purchaseOrderItem.id;
    allocations.set(sourceId, (allocations.get(sourceId) ?? 0) + arrivalReceiptQty);
    const pendingInboundQty = arrivalReceiptQty - rejectedReceiptQty;
    // The preview must explicitly say IQC is required before this line can
    // defer its warehouse. Missing fields from an older API stay strict.
    const requiresWarehouse =
      pendingInboundQty > RECEIPT_QTY_EPSILON && draft.source.incomingInspectionRequired !== true;
    if (requiresWarehouse && !draft.warehouse?.id) {
      return `${lineLabel}请选择实际入库仓`;
    }
    if (!draft.warehouse?.id && (draft.location || draft.storageLocation.trim())) {
      return `${lineLabel}填写入库仓位前请先选择实际入库仓`;
    }
    if (rejectedReceiptQty > 0 && !draft.rejectReason.trim()) {
      return `${lineLabel}填写拒收数量后必须填写拒收原因`;
    }
    const material = draft.source.purchaseOrderItem.material;
    if (
      requiresMaterialBatchNo(material) &&
      pendingInboundQty > RECEIPT_QTY_EPSILON &&
      !draft.batchNo.trim()
    ) {
      return `${lineLabel}该物料需要系统批号，请填写或自动生成`;
    }
    const shelfLifeDays = getEffectiveMaterialShelfLifeDays(material);
    if (
      shelfLifeDays > 0 &&
      pendingInboundQty > RECEIPT_QTY_EPSILON &&
      !draft.productionDate &&
      !draft.expiryDate
    ) {
      return `${lineLabel}保质期物料请填写生产日期或有效期`;
    }
  }

  if (!hasAction) {
    return '至少填写一行本次实际到货数量';
  }

  for (const [index, draft] of drafts.entries()) {
    const capacity = Number(draft.source.remainingReceiptCapacityReceiptQty);
    const allocated = allocations.get(draft.source.purchaseOrderItem.id) ?? 0;
    if (!Number.isFinite(capacity) || capacity < 0 || allocated - capacity > RECEIPT_QTY_EPSILON) {
      return `第 ${index + 1} 行同一采购订单明细的实际到货合计不能超过最大可收数量`;
    }
  }

  return null;
}
