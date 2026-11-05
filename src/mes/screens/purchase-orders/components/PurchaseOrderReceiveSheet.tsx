import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PurchaseReceiptReceiveOutcome } from '../../../types/models/PurchaseReceiptReceiveOutcome';
import type { PurchaseReceiptSourcePreviewDto } from '../../../types/models/PurchaseReceiptSourcePreviewDto';
import { purchaseReceiptService } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { today } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';
import { PurchaseOrderReceiveItemCard } from './PurchaseOrderReceiveItemCard.tsx';
import { PurchaseOrderReceiveOutcome } from './PurchaseOrderReceiveOutcome.tsx';
import {
  createPurchaseOrderReceiveDraft,
  createSplitPurchaseOrderReceiveDraft,
  getPurchaseOrderReceiveAllocations,
  type PurchaseOrderReceiveDraft,
  parsePurchaseOrderReceiveQty,
  validatePurchaseOrderReceiveDrafts,
} from './purchase-order-receive.ts';

interface PurchaseOrderReceiveSheetProps {
  visible: boolean;
  purchaseOrderId: string;
  orderNo: string;
  onClose: () => void;
  /** 收货成功后刷新来源采购订单。 */
  onSuccess: () => void;
  /** 有采购入库查看权限时，打开刚创建的采购入库详情。 */
  onOpenReceipt?: (receiptId: string) => void;
}

function createClientRequestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `app-purchase-receive-${Math.random().toString(36).slice(2, 14)}`
  );
}

export function PurchaseOrderReceiveSheet({
  visible,
  purchaseOrderId,
  orderNo,
  onClose,
  onSuccess,
  onOpenReceipt,
}: PurchaseOrderReceiveSheetProps) {
  const { colors } = useTheme();
  const [preview, setPreview] = useState<PurchaseReceiptSourcePreviewDto | null>(null);
  const [items, setItems] = useState<PurchaseOrderReceiveDraft[]>([]);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [receiptDate, setReceiptDate] = useState(today());
  const [supplierDeliveryNo, setSupplierDeliveryNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [pendingQualityReceipt, setPendingQualityReceipt] = useState<{
    id: string;
    receiptNo: string;
  } | null>(null);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    setPreview(null);
    setItems([]);
    setWarehouse(null);
    setReceiptDate(today());
    setSupplierDeliveryNo('');
    setRemarks('');
    setRequestId(createClientRequestId());
    setPendingQualityReceipt(null);
    setLoading(true);
    void purchaseReceiptService
      .previewSource({ purchaseOrderId })
      .then((result) => {
        if (cancelled) return;
        if (result.items.length === 0) {
          toast.info('当前订单没有可收明细');
          onClose();
          return;
        }
        setPreview(result);
        const recommendedWarehouse =
          result.warehouseRecommendation.status === 'resolved' &&
          result.warehouseRecommendation.warehouse
            ? result.warehouseRecommendation.warehouse
            : null;
        setWarehouse(recommendedWarehouse);
        setItems(
          result.items.map((item) => createPurchaseOrderReceiveDraft(item, recommendedWarehouse)),
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : '加载可收明细失败');
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onClose, purchaseOrderId, visible]);

  const updateItem = useCallback((key: string, patch: Partial<PurchaseOrderReceiveDraft>) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }, []);

  const handleDefaultWarehouseChange = useCallback((nextWarehouse: Warehouse | null) => {
    setWarehouse(nextWarehouse);
    setItems((current) =>
      current.map((item) => {
        if (item.warehouseSource === 'manual') return item;
        const inheritedWarehouse = nextWarehouse ?? item.source.defaultWarehouse ?? null;
        const warehouseChanged = item.warehouse?.id !== inheritedWarehouse?.id;
        return {
          ...item,
          warehouse: inheritedWarehouse,
          warehouseSource: nextWarehouse
            ? 'header'
            : inheritedWarehouse
              ? 'sourceDefault'
              : undefined,
          ...(warehouseChanged
            ? {
                batchNo: '',
                location: null,
                storageLocation: '',
              }
            : {}),
        };
      }),
    );
  }, []);

  const duplicateItem = useCallback((key: string) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.key === key);
      if (index < 0) return current;
      const splitDraft = createSplitPurchaseOrderReceiveDraft(current[index]);
      return [...current.slice(0, index + 1), splitDraft, ...current.slice(index + 1)];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const sourceAllocations = useMemo(() => getPurchaseOrderReceiveAllocations(items), [items]);

  const handleSubmit = useCallback(async () => {
    if (!preview || !requestId) return;
    const validationError = validatePurchaseOrderReceiveDrafts(items);
    if (validationError) {
      toast.info(validationError);
      return;
    }
    const preparedItems = items.map((item) => ({
      ...item,
      arrivalReceiptQty: parsePurchaseOrderReceiveQty(item.arrivalReceiptQty),
      rejectedReceiptQty: parsePurchaseOrderReceiveQty(item.rejectedReceiptQty),
    }));

    setSubmitting(true);
    try {
      const result = await purchaseReceiptService.receive({
        purchaseOrderId,
        supplierId: preview.supplierId,
        defaultWarehouseId: warehouse?.id ?? null,
        receiptDate: receiptDate || undefined,
        supplierDeliveryNo: supplierDeliveryNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
        clientRequestId: requestId,
        items: preparedItems
          .filter((item) => item.arrivalReceiptQty > 0)
          .map((item) => ({
            purchaseOrderItemId: item.source.purchaseOrderItem.id,
            materialId: item.source.purchaseOrderItem.materialId,
            arrivalReceiptQty: item.arrivalReceiptQty,
            rejectedReceiptQty: item.rejectedReceiptQty || undefined,
            rejectReason: item.rejectReason.trim() || undefined,
            receiptUnit: item.source.receiptUnit,
            warehouseId: item.warehouse?.id,
            batchNo: item.batchNo.trim() || undefined,
            productionDate: item.productionDate || undefined,
            expiryDate: item.expiryDate || undefined,
            supplierBatchNo: item.supplierBatchNo.trim() || undefined,
            grade: item.grade || undefined,
            locationId: item.location?.id,
            storageLocation: item.storageLocation.trim() || undefined,
            remarks: item.remarks.trim() || undefined,
          })),
      });
      toast.success(result.message);
      if (result.warnings?.length) {
        toast.info(result.warnings.join('\n'), '收货提示');
      }
      onSuccess();
      if (result.outcome === PurchaseReceiptReceiveOutcome.PENDING_QUALITY) {
        setPendingQualityReceipt({ id: result.receipt.id, receiptNo: result.receipt.receiptNo });
        return;
      }
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '收货失败');
    } finally {
      setSubmitting(false);
    }
  }, [
    items,
    onClose,
    onSuccess,
    preview,
    purchaseOrderId,
    receiptDate,
    remarks,
    requestId,
    supplierDeliveryNo,
    warehouse,
  ]);

  const handlePendingQualityConfirm = useCallback(() => {
    if (!pendingQualityReceipt) return;
    if (onOpenReceipt) {
      onOpenReceipt(pendingQualityReceipt.id);
      return;
    }
    onClose();
  }, [onClose, onOpenReceipt, pendingQualityReceipt]);

  const canSubmit = Boolean(preview && !loading && !submitting);
  const confirmDisabledHint = loading
    ? '正在加载可收明细，请稍候'
    : !preview
      ? '可收明细未加载，请关闭后重试'
      : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      closeDisabled={submitting}
      title={pendingQualityReceipt ? '收货已登记' : '采购收货'}
      subtitle={
        pendingQualityReceipt
          ? pendingQualityReceipt.receiptNo
          : preview
            ? `${orderNo} · ${preview.supplier?.name ?? '供应商'}`
            : orderNo
      }
      confirmText={pendingQualityReceipt ? (onOpenReceipt ? '查看采购入库单' : '完成') : '确认收货'}
      cancelText={pendingQualityReceipt ? '稍后处理' : undefined}
      onConfirm={pendingQualityReceipt ? handlePendingQualityConfirm : handleSubmit}
      loading={submitting}
      disabled={pendingQualityReceipt ? false : !canSubmit}
      confirmDisabledHint={pendingQualityReceipt ? undefined : confirmDisabledHint}
      avoidKeyboard
      maxHeightRatio={0.92}
    >
      {pendingQualityReceipt ? (
        <PurchaseOrderReceiveOutcome
          receiptNo={pendingQualityReceipt.receiptNo}
          canOpenReceipt={Boolean(onOpenReceipt)}
        />
      ) : loading ? (
        <InlineLoading size="large" style={styles.loading} />
      ) : preview ? (
        <>
          {preview.warehouseRecommendation.status !== 'resolved' ? (
            <View style={[styles.notice, { backgroundColor: colors.warningSurface }]}>
              <Text style={[styles.noticeText, { color: colors.warning }]}>
                {preview.warehouseRecommendation.reason || '请人工选择入库仓库'}
              </Text>
            </View>
          ) : null}
          <WarehousePickerField
            label="默认入库仓"
            value={warehouse}
            onChange={handleDefaultWarehouseChange}
            placeholder="可选；用于带入未手工调整的明细"
            clearable
          />
          <DatePickerField
            label="收货日期"
            value={receiptDate}
            onChange={setReceiptDate}
            showCurrentShortcut
            maximumDate={today()}
            required
            clearable={false}
          />
          <FormField
            label="供应商送货单号"
            value={supplierDeliveryNo}
            onChangeText={setSupplierDeliveryNo}
            placeholder="可选，用于供应商送货单追溯"
            maxLength={128}
          />
          <View style={[styles.notice, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
              请填写本次实际到货数量；合格入库数量由后端按来料检验策略确认。现场拒收需填写数量和原因；拆分后同一采购订单明细的实际到货合计不得超过最大可收数量。
            </Text>
          </View>
          {items.map((item, index) => (
            <PurchaseOrderReceiveItemCard
              key={item.key}
              item={item}
              index={index}
              sourceAllocatedQty={sourceAllocations.get(item.source.purchaseOrderItem.id) ?? 0}
              onUpdate={(patch) => updateItem(item.key, patch)}
              onDuplicate={() => duplicateItem(item.key)}
              onRemove={() => removeItem(item.key)}
              canRemove={item.key !== item.source.purchaseOrderItem.id}
            />
          ))}
          <FormField
            label="收货备注"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="可选"
            multiline
            numberOfLines={2}
          />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: Spacing.xl },
  notice: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  noticeText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  itemHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
