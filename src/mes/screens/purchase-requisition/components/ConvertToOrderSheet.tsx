import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  type PurchaseRequisition,
  type PurchaseSourcingPreview,
  purchaseRequisitionService,
  type UpdateRequisitionArrivalDateItemDto,
} from '../../../host/services';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDateStr } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

interface ConvertToOrderSheetProps {
  visible: boolean;
  requisition: PurchaseRequisition;
  onClose: () => void;
  onSuccess: () => void;
  onRequisitionUpdated?: () => void | Promise<void>;
}

function getRemainingQty(requiredQty?: number, orderedQty?: number): number {
  return Math.max(0, Number(requiredQty ?? 0) - Number(orderedQty ?? 0));
}

function normalizeQtyInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';

  const [integerPart = '', ...decimalParts] = cleaned.split('.');
  if (decimalParts.length === 0) return integerPart;

  return `${integerPart || '0'}.${decimalParts.join('')}`;
}

function buildInitialQuantities(requisition: PurchaseRequisition): Record<string, string> {
  return Object.fromEntries(
    (requisition.items ?? [])
      .map((item) => [item.id, String(getRemainingQty(item.requiredQty, item.orderedQty))])
      .filter(([, quantity]) => Number(quantity) > 0),
  );
}

export function ConvertToOrderSheet({
  visible,
  requisition,
  onClose,
  onSuccess,
  onRequisitionUpdated,
}: ConvertToOrderSheetProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [arrivalDateDrafts, setArrivalDateDrafts] = useState<Record<string, string | undefined>>(
    {},
  );
  const [savedArrivalDates, setSavedArrivalDates] = useState<Record<string, string | undefined>>(
    {},
  );
  const [arrivalSaving, setArrivalSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<PurchaseSourcingPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 仅在单据身份或弹窗可见性变化时重置；对象引用刷新不能覆盖用户已编辑的转换草稿。
  // biome-ignore lint/correctness/useExhaustiveDependencies: requisition.id 是有意使用的身份依赖。
  useEffect(() => {
    if (!visible) return;
    setQuantities(buildInitialQuantities(requisition));
    setArrivalDateDrafts({});
    setSavedArrivalDates({});
    setPreview(null);
  }, [visible, requisition.id]);

  const remainingItems = useMemo(
    () =>
      (requisition.items ?? []).filter(
        (item) => getRemainingQty(item.requiredQty, item.orderedQty) > 0,
      ),
    [requisition],
  );

  const selectedCount = remainingItems.filter(
    (item) => Number(quantities[item.id] ?? 0) > 0,
  ).length;

  const selectedItems = useMemo(
    () =>
      remainingItems
        .map((item) => ({
          requisitionItemId: item.id,
          orderedQty: Number(quantities[item.id] ?? 0),
        }))
        .filter((item) => item.orderedQty > 0),
    [quantities, remainingItems],
  );

  const selectedMissingArrivalItems = useMemo(
    () =>
      remainingItems.filter(
        (item) =>
          Number(quantities[item.id] ?? 0) > 0 &&
          !(item.expectedArrivalDate || savedArrivalDates[item.id]),
      ),
    [quantities, remainingItems, savedArrivalDates],
  );

  const missingArrivalDraftsComplete = useMemo(
    () => selectedMissingArrivalItems.every((item) => Boolean(arrivalDateDrafts[item.id])),
    [arrivalDateDrafts, selectedMissingArrivalItems],
  );

  useEffect(() => {
    if (!visible || selectedItems.length === 0 || selectedMissingArrivalItems.length > 0) {
      setPreview(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const nextPreview = await purchaseRequisitionService.convertPreview(
          requisition.id,
          selectedItems,
        );
        if (!cancelled) setPreview(nextPreview);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [requisition.id, selectedItems, selectedMissingArrivalItems.length, visible]);

  const handleSaveArrivalDates = async () => {
    if (selectedMissingArrivalItems.length === 0) return;
    if (!missingArrivalDraftsComplete) {
      toast.error('请先补齐选中明细的到货日期');
      return;
    }

    const items: UpdateRequisitionArrivalDateItemDto[] = selectedMissingArrivalItems.map(
      (item) => ({
        requisitionItemId: item.id,
        expectedArrivalDate: arrivalDateDrafts[item.id] ?? '',
      }),
    );

    setArrivalSaving(true);
    try {
      const updated = await purchaseRequisitionService.updateArrivalDates(requisition.id, items);
      setSavedArrivalDates(
        Object.fromEntries(
          (updated.items ?? [])
            .filter((item) => item.expectedArrivalDate)
            .map((item) => [item.id, item.expectedArrivalDate ?? undefined]),
        ),
      );
      setArrivalDateDrafts({});
      toast.success('到货日期已保存');
      void onRequisitionUpdated?.();
    } finally {
      setArrivalSaving(false);
    }
  };

  const handleSubmit = async () => {
    for (const item of remainingItems) {
      const rawQty = quantities[item.id] ?? '';
      if (!rawQty) continue;

      const orderedQty = Number(rawQty);
      const remainingQty = getRemainingQty(item.requiredQty, item.orderedQty);

      if (Number.isNaN(orderedQty)) {
        toast.error(`【${item.material?.name ?? item.materialId}】本次转单数量格式不正确`);
        return;
      }
      if (orderedQty < 0) {
        toast.error(`【${item.material?.name ?? item.materialId}】本次转单数量不能小于 0`);
        return;
      }
      if (orderedQty === 0) continue;
      if (orderedQty > remainingQty) {
        toast.error(
          `【${item.material?.name ?? item.materialId}】本次转单数量不能超过剩余 ${formatNumber(
            remainingQty,
            { maximumFractionDigits: 4 },
          )}`,
        );
        return;
      }
    }

    if (selectedItems.length === 0) {
      toast.error('请至少填写一条转单明细');
      return;
    }
    if (selectedMissingArrivalItems.length > 0) {
      toast.error('请先保存选中明细的到货日期');
      return;
    }

    setSubmitting(true);
    try {
      const result = await purchaseRequisitionService.convertToOrders(
        requisition.id,
        selectedItems,
        true,
      );
      if (!result.orders?.length) {
        toast.error('没有可生成采购订单的明细，请先在 PC 端指定供应商');
        return;
      }
      toast.success(
        `已创建 ${result.orders.length} 张采购订单${
          result.unresolvedCount ? `，${result.unresolvedCount} 条待处理` : ''
        }`,
      );
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`转采购订单 · ${requisition.prNo}`}
      confirmText={selectedCount > 0 ? `确认转单 (${selectedCount})` : '确认转单'}
      onConfirm={handleSubmit}
      loading={submitting}
      disabled={remainingItems.length === 0}
      confirmDisabledHint={remainingItems.length === 0 ? '请至少填写一条本次转单数量' : undefined}
      avoidKeyboard
      maxHeightRatio={0.85}
    >
      <View style={styles.content}>
        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          只会按本次填写的数量创建采购订单。留空或填 0 表示本次不转该行。
        </Text>
        <TouchableOpacity
          style={[styles.restoreBtn, { borderColor: colors.primary }]}
          onPress={() => setQuantities(buildInitialQuantities(requisition))}
          activeOpacity={0.7}
        >
          <Text style={[styles.restoreBtnText, { color: colors.primary }]}>恢复全部剩余数量</Text>
        </TouchableOpacity>

        {preview || previewLoading ? (
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor:
                  preview?.unresolvedCount && preview.unresolvedCount > 0
                    ? colors.warningSurface
                    : colors.successLight,
                borderColor:
                  preview?.unresolvedCount && preview.unresolvedCount > 0
                    ? colors.warning
                    : colors.success,
              },
            ]}
          >
            {previewLoading ? (
              <View style={styles.previewLoading}>
                <InlineLoading color={colors.primary} />
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  正在判定供应商...
                </Text>
              </View>
            ) : preview ? (
              <>
                <Text
                  style={[
                    styles.previewTitle,
                    {
                      color: preview.unresolvedCount > 0 ? colors.warning : colors.success,
                    },
                  ]}
                >
                  预计生成 {preview.orderCount} 张采购订单
                </Text>
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  已确定 {preview.resolvedCount} 行 · 待处理 {preview.unresolvedCount} 行
                </Text>
                {preview.unresolvedItems.slice(0, 3).map((item) => (
                  <Text
                    key={item.requisitionItemId}
                    style={[styles.previewReason, { color: colors.warning }]}
                    numberOfLines={1}
                  >
                    {item.materialName ?? item.materialId}: {item.reason}
                  </Text>
                ))}
              </>
            ) : null}
          </View>
        ) : null}

        {selectedMissingArrivalItems.length > 0 ? (
          <View
            style={[
              styles.missingBox,
              { backgroundColor: colors.warningSurface, borderColor: colors.warning },
            ]}
          >
            <Text style={[styles.missingTitle, { color: colors.warning }]}>
              {selectedMissingArrivalItems.length} 条选中明细缺少到货日期
            </Text>
            <Text style={[styles.missingText, { color: colors.textSecondary }]}>
              到货日期会带入采购订单明细交货日期。请在对应行选择日期并保存后再转单。
            </Text>
            <TouchableOpacity
              style={[
                styles.saveArrivalBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: missingArrivalDraftsComplete ? 1 : 0.5,
                },
              ]}
              onPress={handleSaveArrivalDates}
              disabled={!missingArrivalDraftsComplete || arrivalSaving}
              activeOpacity={0.8}
            >
              {arrivalSaving ? (
                <InlineLoading color={colors.textOnPrimary} />
              ) : (
                <Ionicons name="save-outline" size={16} color={colors.textOnPrimary} />
              )}
              <Text style={[styles.saveArrivalText, { color: colors.textOnPrimary }]}>
                保存到货日期
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {remainingItems.map((item) => {
          const remainingQty = getRemainingQty(item.requiredQty, item.orderedQty);
          const effectiveArrivalDate = item.expectedArrivalDate || savedArrivalDates[item.id];
          const selectedQty = Number(quantities[item.id] ?? 0);
          const materialSpec = item.material?.spec || '未维护规格';
          const lineNo = Number.isFinite(Number(item.sortOrder))
            ? Number(item.sortOrder) + 1
            : undefined;
          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.material?.name ?? '-'}
                  </Text>
                  <Text style={[styles.itemCode, { color: colors.textSecondary }]}>
                    {lineNo ? `第 ${lineNo} 行 · ` : ''}
                    {item.material?.code ?? '-'}
                  </Text>
                  <Text
                    style={[
                      styles.itemCode,
                      {
                        color: item.material?.spec ? colors.textSecondary : colors.warning,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    规格: {materialSpec}
                  </Text>
                </View>
                <Text style={[styles.remainingText, { color: colors.primary }]}>
                  剩余 {formatQtyWithUnit(remainingQty, item.material?.unit, unitLabelMap)}
                </Text>
              </View>

              <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                需求 {formatQtyWithUnit(item.requiredQty, item.material?.unit, unitLabelMap)} ·
                已下单 {formatQtyWithUnit(item.orderedQty, item.material?.unit, unitLabelMap)}
              </Text>
              {effectiveArrivalDate ? (
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  到货日期 {formatDateStr(effectiveArrivalDate)}
                </Text>
              ) : selectedQty > 0 ? (
                <DatePickerField
                  label="到货日期"
                  required
                  value={arrivalDateDrafts[item.id]}
                  onChange={(expectedArrivalDate) =>
                    setArrivalDateDrafts((prev) => ({
                      ...prev,
                      [item.id]: expectedArrivalDate || undefined,
                    }))
                  }
                  placeholder="请选择到货日期"
                  containerStyle={styles.dateField}
                />
              ) : (
                <Text style={[styles.itemMeta, { color: colors.warning }]}>到货日期未填写</Text>
              )}

              <QuickNumInput
                label="本次转单数量"
                value={quantities[item.id] ?? ''}
                onChangeText={(text) =>
                  setQuantities((prev) => ({
                    ...prev,
                    [item.id]: normalizeQtyInput(text),
                  }))
                }
                placeholder={`最多 ${formatNumber(remainingQty, { maximumFractionDigits: 4 })}`}
                max={remainingQty}
                min={0}
                step={1}
                unit={formatUnitLabel(item.material?.unit, unitLabelMap)}
              />
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
  },
  tip: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  restoreBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  restoreBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  previewBox: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 4,
  },
  previewLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  previewTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  previewText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  previewReason: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  missingBox: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  missingTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  missingText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  saveArrivalBtn: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  saveArrivalText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  itemCode: {
    fontSize: FontSize.xs,
  },
  remainingText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: FontSize.xs,
  },
  dateField: {
    marginTop: Spacing.xs,
  },
});
