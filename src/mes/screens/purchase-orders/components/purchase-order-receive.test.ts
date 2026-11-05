import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import type { PurchaseReceiptSourcePreviewItemDto } from '../../../types/models/PurchaseReceiptSourcePreviewItemDto';
import {
  createPurchaseOrderReceiveDraft,
  createSplitPurchaseOrderReceiveDraft,
  getPurchaseOrderReceiveAllocations,
  validatePurchaseOrderReceiveDrafts,
} from './purchase-order-receive.ts';

function source(overrides: Record<string, unknown> = {}): PurchaseReceiptSourcePreviewItemDto {
  return {
    outstandingQty: 10,
    purchaseOrderItem: {
      id: 'line-1',
      materialId: 'material-1',
      orderedQty: 10,
      receivedQty: 0,
      baseUnit: 'PCS',
      material: { id: 'material-1', name: '物料1', unit: 'PCS' },
    },
    receiptUnit: 'PCS',
    receivableQty: 10,
    receivableReceiptQty: 10,
    remainingReceiptCapacityQty: 10,
    remainingReceiptCapacityReceiptQty: 10,
    reservedQty: 0,
    defaultWarehouse: { id: 'warehouse-1', name: '原料仓', code: 'RAW-01' },
    ...overrides,
  } as PurchaseReceiptSourcePreviewItemDto;
}

describe('purchase order receive drafts', () => {
  it('requires a batch and shelf-life date for shelf-life material', () => {
    const baseSource = source();
    const shelfLifeSource = source({
      purchaseOrderItem: {
        ...baseSource.purchaseOrderItem,
        material: {
          ...baseSource.purchaseOrderItem.material,
          hasBatchTracking: false,
          family: { defaultShelfLifeDays: 30 },
        },
      },
    });
    const draft = createPurchaseOrderReceiveDraft(shelfLifeSource);

    assert.match(
      validatePurchaseOrderReceiveDrafts([{ ...draft, arrivalReceiptQty: '1' }]) ?? '',
      /系统批号/,
    );
    assert.match(
      validatePurchaseOrderReceiveDrafts([
        { ...draft, arrivalReceiptQty: '1', batchNo: 'BN-001' },
      ]) ?? '',
      /生产日期或有效期/,
    );
    assert.equal(
      validatePurchaseOrderReceiveDrafts([
        {
          ...draft,
          arrivalReceiptQty: '1',
          batchNo: 'BN-001',
          productionDate: '2026-10-01',
        },
      ]),
      null,
    );
  });

  it('defaults the actual arrival quantity from the backend suggestion and keeps the source grade', () => {
    const draft = createPurchaseOrderReceiveDraft(
      source({ purchaseOrderItem: { ...source().purchaseOrderItem, grade: 'A' } }),
    );

    assert.equal(draft.arrivalReceiptQty, '10');
    assert.equal(draft.grade, 'A');
    assert.equal(draft.warehouse?.id, 'warehouse-1');
    assert.equal(draft.warehouseSource, 'sourceDefault');
  });

  it('uses the header default warehouse for a new line when one is selected', () => {
    const headerWarehouse = source().defaultWarehouse;
    if (!headerWarehouse) throw new Error('test source must have a default warehouse');
    const draft = createPurchaseOrderReceiveDraft(source(), {
      ...headerWarehouse,
      id: 'warehouse-2',
      name: '成品仓',
      code: 'FG-01',
    });

    assert.equal(draft.warehouse?.id, 'warehouse-2');
    assert.equal(draft.warehouseSource, 'header');
  });

  it('gives a split row its own key and clears row-specific facts', () => {
    const draft = createPurchaseOrderReceiveDraft(source());
    const split = createSplitPurchaseOrderReceiveDraft({
      ...draft,
      arrivalReceiptQty: '3',
      batchNo: 'B-001',
      storageLocation: 'A-01',
    });

    assert.notEqual(split.key, draft.key);
    assert.equal(split.arrivalReceiptQty, '');
    assert.equal(split.batchNo, '');
    assert.equal(split.storageLocation, '');
    assert.equal(split.warehouse?.id, draft.warehouse?.id);
  });

  it('requires an actual warehouse for a positive accepted quantity', () => {
    const draft = createPurchaseOrderReceiveDraft(source({ defaultWarehouse: null }));

    assert.match(
      validatePurchaseOrderReceiveDrafts([{ ...draft, arrivalReceiptQty: '1' }]) ?? '',
      /实际入库仓/,
    );
  });

  it('rejects a location when the row has no actual warehouse', () => {
    const draft = createPurchaseOrderReceiveDraft(source({ defaultWarehouse: null }));

    assert.match(
      validatePurchaseOrderReceiveDrafts([
        { ...draft, arrivalReceiptQty: '', storageLocation: 'A-01' },
      ]) ?? '',
      /入库仓位前请先选择实际入库仓/,
    );
  });

  it('validates the combined actual arrival quantity across split rows', () => {
    const first = createPurchaseOrderReceiveDraft(source());
    const second = createSplitPurchaseOrderReceiveDraft(first);
    const drafts = [
      { ...first, arrivalReceiptQty: '6' },
      { ...second, arrivalReceiptQty: '4', rejectedReceiptQty: '1', rejectReason: '破损' },
    ];

    assert.equal(getPurchaseOrderReceiveAllocations(drafts).get('line-1'), 10);
    assert.equal(validatePurchaseOrderReceiveDrafts(drafts), null);
    const overCapacityError = validatePurchaseOrderReceiveDrafts([
      ...drafts,
      { ...createSplitPurchaseOrderReceiveDraft(second), arrivalReceiptQty: '0.1' },
    ]);
    assert.ok(overCapacityError);
    assert.match(overCapacityError, /不能超过最大可收数量/);
  });

  it('does not allow the rejected quantity to exceed actual arrival', () => {
    const draft = createPurchaseOrderReceiveDraft(source());

    assert.match(
      validatePurchaseOrderReceiveDrafts([
        { ...draft, arrivalReceiptQty: '3', rejectedReceiptQty: '3.1', rejectReason: '破损' },
      ]) ?? '',
      /拒收数量不能超过本次实际到货数量/,
    );
  });

  it('does not require a qualified warehouse before a line that requires IQC is released', () => {
    const draft = createPurchaseOrderReceiveDraft(
      source({ defaultWarehouse: null, incomingInspectionRequired: true }),
    );

    assert.equal(validatePurchaseOrderReceiveDrafts([{ ...draft, arrivalReceiptQty: '1' }]), null);
  });
});
