import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  type ProductionOutputBuffer,
  productionReceiptService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { PRODUCTION_OUTPUT_DISPOSAL_TYPE } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

type OutputBufferMode = 'generate' | 'special' | 'dispose';

interface OutputBufferActionSheetProps {
  buffer: ProductionOutputBuffer | null;
  canUpdateLocation: boolean;
  canGenerateReceipt: boolean;
  canSpecialReceipt: boolean;
  canDispose: boolean;
  onEditLocation: (buffer: ProductionOutputBuffer) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const MODE_TITLE: Record<OutputBufferMode, string> = {
  generate: '生成生产入库单',
  special: '特批生成生产入库单',
  dispose: '登记暂存异常',
};

export function OutputBufferActionSheet({
  buffer,
  canUpdateLocation,
  canGenerateReceipt,
  canSpecialReceipt,
  canDispose,
  onEditLocation,
  onClose,
  onSuccess,
}: OutputBufferActionSheetProps) {
  const { colors } = useTheme();
  const { options: specialReasonOptions } = useDict('production_receipt_special_reason');
  const { options: disposalTypeOptions } = useDict('production_output_disposal_type');
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [mode, setMode] = useState<OutputBufferMode | null>(null);
  const [qty, setQty] = useState('');
  const [specialReason, setSpecialReason] = useState('');
  const [disposalType, setDisposalType] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bufferId = buffer?.id;
  const openQty = Number(buffer?.openQty ?? 0);
  const unitLabel = formatUnitLabel(buffer?.material?.unit, unitLabelMap);

  useEffect(() => {
    if (!bufferId) return;
    setMode(null);
    setQty(openQty > 0 ? String(openQty) : '');
    setSpecialReason('');
    setDisposalType('');
    setReason('');
    setRemarks('');
  }, [bufferId, openQty]);

  const title = mode ? MODE_TITLE[mode] : '生产暂存操作';

  const actionOptions = useMemo(
    () =>
      [
        canUpdateLocation
          ? {
              key: 'location',
              icon: 'location-outline' as const,
              title: '补录暂存位置',
              description: '登记线边货架、暂存区等找货位置',
              onPress: () => {
                if (!buffer) return;
                onClose();
                onEditLocation(buffer);
              },
            }
          : null,
        canGenerateReceipt
          ? {
              key: 'generate',
              icon: 'cube-outline' as const,
              title: '生成生产入库单',
              description: '按待处理数量生成待确认生产入库单',
              onPress: () => setMode('generate'),
            }
          : null,
        canSpecialReceipt
          ? {
              key: 'special',
              icon: 'shield-checkmark-outline' as const,
              title: '特批生成生产入库单',
              description: '非完整包装或策略例外时记录特批原因',
              onPress: () => setMode('special'),
            }
          : null,
        canDispose
          ? {
              key: 'dispose',
              icon: 'trash-outline' as const,
              title: '登记暂存异常',
              description: '报废、返工进入质量待处置；盘点差异可最终核销',
              onPress: () => setMode('dispose'),
            }
          : null,
      ].filter((item): item is NonNullable<typeof item> => item !== null),
    [
      buffer,
      canDispose,
      canGenerateReceipt,
      canSpecialReceipt,
      canUpdateLocation,
      onClose,
      onEditLocation,
    ],
  );

  const handleSubmit = useCallback(async () => {
    if (!buffer || !mode) return;
    const parsedQty = Number(qty);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      toast.info('请输入有效数量');
      return;
    }
    if (parsedQty > openQty) {
      toast.info('处理数量不能超过待处理数量');
      return;
    }
    if (mode === 'special' && !specialReason) {
      toast.info('请选择特批原因');
      return;
    }
    if (mode === 'dispose' && !disposalType) {
      toast.info('请选择处置类型');
      return;
    }
    if (mode === 'dispose' && !reason.trim()) {
      toast.info('请填写处置原因');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'dispose') {
        await productionReceiptService.disposeOutputBuffer({
          id: buffer.id,
          qty: parsedQty,
          disposalType,
          reason: reason.trim(),
        });
        toast.success(
          disposalType === PRODUCTION_OUTPUT_DISPOSAL_TYPE.FINAL_WRITE_OFF
            ? '暂存数量已最终核销'
            : '已登记生产不合格并生成待处置单',
        );
      } else {
        await productionReceiptService.generateFromOutputBuffer({
          id: buffer.id,
          qty: parsedQty,
          specialReason: mode === 'special' ? specialReason : undefined,
          remarks: remarks.trim() || undefined,
        });
        toast.success(mode === 'special' ? '已特批生成生产入库单' : '已生成生产入库单');
      }
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    } finally {
      setSubmitting(false);
    }
  }, [buffer, disposalType, mode, onSuccess, openQty, qty, reason, remarks, specialReason]);

  return (
    <BottomSheet
      visible={!!buffer}
      onClose={onClose}
      title={title}
      subtitle={buffer?.workOrder?.orderNo}
      confirmText={mode ? '提交' : undefined}
      onConfirm={handleSubmit}
      loading={submitting}
      avoidKeyboard
      dynamicHeight={!mode}
      maxHeightRatio={0.84}
    >
      {buffer ? (
        <>
          <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {buffer.material?.name ?? '-'}
              {buffer.material?.code ? `（${buffer.material.code}）` : ''}
            </Text>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              批号 {buffer.batchNo || '-'} · 待处理{' '}
              {formatQtyWithUnit(openQty, buffer.material?.unit, unitLabelMap)}
            </Text>
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              暂存位置：
              {buffer.location?.pathName ||
                buffer.location?.name ||
                buffer.storageLocation ||
                '未登记'}
            </Text>
          </View>

          {!mode ? (
            <View style={styles.actionList}>
              {actionOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={[styles.actionRow, { borderColor: colors.border }]}
                  onPress={option.onPress}
                >
                  <View style={[styles.actionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                    <Ionicons name={option.icon} size={20} color={colors.primary} />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>{option.title}</Text>
                    <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <>
              <QuickNumInput
                label={`处理数量（${unitLabel || '基础单位'}）`}
                required
                value={qty}
                onChangeText={setQty}
                min={0}
                max={openQty}
                hint={`最多 ${formatQtyWithUnit(openQty, buffer.material?.unit, unitLabelMap)}`}
                clampToBounds={false}
              />
              {mode === 'special' ? (
                <ChipSelectField
                  label="特批原因"
                  required
                  options={specialReasonOptions.map((option) => ({
                    value: String(option.value),
                    label: option.label,
                  }))}
                  value={specialReason}
                  onChange={setSpecialReason}
                  clearable
                />
              ) : null}
              {mode === 'dispose' ? (
                <>
                  <View style={[styles.disposalHint, { backgroundColor: colors.warningSurface }]}>
                    <Text style={[styles.disposalHintText, { color: colors.warning }]}>
                      报废和返工会先冻结为质量待处置，并自动生成生产不合格记录和待处置单；只有盘点核销会直接终结数量。
                    </Text>
                  </View>
                  <ChipSelectField
                    label="处置类型"
                    required
                    options={disposalTypeOptions.map((option) => ({
                      value: String(option.value),
                      label: option.label,
                    }))}
                    value={disposalType}
                    onChange={setDisposalType}
                    clearable
                  />
                  <FormField
                    label="处置原因"
                    required
                    value={reason}
                    onChangeText={setReason}
                    placeholder="请填写处置原因"
                    multiline
                    numberOfLines={2}
                  />
                </>
              ) : (
                <FormField
                  label="备注"
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="可选"
                  multiline
                  numberOfLines={2}
                />
              )}
            </>
          )}
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
  actionList: {
    gap: Spacing.sm,
  },
  disposalHint: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  disposalHintText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  actionRow: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
