import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type ProductionReceiptOrder,
  productionReceiptService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

interface ProductionReceiptReverseSheetProps {
  receipt: ProductionReceiptOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductionReceiptReverseSheet({
  receipt,
  onClose,
  onSuccess,
}: ProductionReceiptReverseSheetProps) {
  const { colors } = useTheme();
  const { options: reverseReasonOptions } = useDict('production_receipt_reverse_reason');
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [reverseReason, setReverseReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const receiptId = receipt?.id;

  useEffect(() => {
    if (receiptId) {
      setReverseReason('');
    }
  }, [receiptId]);

  const handleSubmit = useCallback(async () => {
    if (!receipt) return;
    if (!reverseReason) {
      toast.info('请选择冲正原因');
      return;
    }
    setSubmitting(true);
    try {
      await productionReceiptService.reverse({
        id: receipt.id,
        reverseReason,
      });
      toast.success('生产入库单已冲正');
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '冲正失败');
    } finally {
      setSubmitting(false);
    }
  }, [receipt, reverseReason, onSuccess]);

  return (
    <BottomSheet
      visible={!!receipt}
      onClose={onClose}
      title="冲正生产入库单"
      subtitle={receipt?.receiptNo}
      confirmText="确认冲正"
      confirmButtonColor={colors.warning}
      onConfirm={handleSubmit}
      loading={submitting}
      avoidKeyboard
      dynamicHeight
    >
      {receipt ? (
        <>
          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {receipt.material?.name ?? '-'}
              {receipt.material?.code ? `（${receipt.material.code}）` : ''}
            </Text>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              工单 {receipt.workOrder?.orderNo ?? '-'}
              {receipt.batchNo ? ` · 批号 ${receipt.batchNo}` : ''}
            </Text>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              已入库{' '}
              {formatQtyWithUnit(
                receipt.actualReceiptQty ?? receipt.plannedReceiptQty,
                receipt.material?.unit,
                unitLabelMap,
              )}
            </Text>
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            冲正会按后端库存规则回滚已入库数量，并记录冲正原因。原因项决定数量回退到暂存或直接核销。
          </Text>
          <ChipSelectField
            label="冲正原因"
            required
            options={reverseReasonOptions.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            value={reverseReason}
            onChange={setReverseReason}
            clearable
          />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: 4,
  },
  summaryTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: FontSize.sm,
  },
  hintText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
