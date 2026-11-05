import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ReceiveSaleReturnItemDto } from '../../../types/models/ReceiveSaleReturnItemDto';
import { getSaleReturnItemUnit, type SaleReturnItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { SALE_RETURN_DISPOSITION_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useScaledFontSize } from '../../../../core/theme/font-scale';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

// 收货处置方式可选项：排除「待处理」（收货即需明确处置）。
// 可再销售=入收货仓可用；不良/返工/报废=入不良品仓隔离；退回客户=不入库不退款。
const RECEIVE_DISPOSITION_OPTIONS = [
  ReceiveSaleReturnItemDto.disposition.RESELLABLE,
  ReceiveSaleReturnItemDto.disposition.DEFECTIVE,
  ReceiveSaleReturnItemDto.disposition.REWORK,
  ReceiveSaleReturnItemDto.disposition.SCRAP,
  ReceiveSaleReturnItemDto.disposition.REJECT_TO_CUSTOMER,
].map((value) => ({
  value,
  label: SALE_RETURN_DISPOSITION_CONFIG[value]?.label ?? value,
}));

interface ReceiveDraftLine {
  id: string;
  materialName: string;
  materialCode: string;
  unit: string;
  returnQty: number;
  receivedQtyText: string;
  hasBatchTracking: boolean;
  disposition: ReceiveSaleReturnItemDto.disposition;
  batchNo: string;
  storageLocation: string;
  remarks: string;
}

interface ReceiveSaleReturnModalProps {
  visible: boolean;
  isIndependentReturn: boolean;
  items: SaleReturnItem[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (items: ReceiveSaleReturnItemDto[]) => void;
}

function getItemName(item: SaleReturnItem): string {
  return item.material?.name ?? item.sourceDeliveryItem?.material?.name ?? '未知物料';
}

function getItemCode(item: SaleReturnItem): string {
  return item.material?.code ?? item.sourceDeliveryItem?.material?.code ?? '-';
}

function toReceiveDisposition(value?: string | null): ReceiveSaleReturnItemDto.disposition {
  if (value == null) {
    return ReceiveSaleReturnItemDto.disposition.RESELLABLE;
  }
  switch (value) {
    case ReceiveSaleReturnItemDto.disposition.RESELLABLE:
      return ReceiveSaleReturnItemDto.disposition.RESELLABLE;
    case ReceiveSaleReturnItemDto.disposition.PENDING:
      return ReceiveSaleReturnItemDto.disposition.PENDING;
    case ReceiveSaleReturnItemDto.disposition.DEFECTIVE:
      return ReceiveSaleReturnItemDto.disposition.DEFECTIVE;
    case ReceiveSaleReturnItemDto.disposition.SCRAP:
      return ReceiveSaleReturnItemDto.disposition.SCRAP;
    case ReceiveSaleReturnItemDto.disposition.REWORK:
      return ReceiveSaleReturnItemDto.disposition.REWORK;
    case ReceiveSaleReturnItemDto.disposition.REJECT_TO_CUSTOMER:
      return ReceiveSaleReturnItemDto.disposition.REJECT_TO_CUSTOMER;
    default:
      throw new Error(`不支持的销售退货处置方式: ${value}`);
  }
}

function buildDraftLines(items: SaleReturnItem[]): ReceiveDraftLine[] {
  return items.map((item) => {
    const returnQty = Number(item.returnQty ?? 0);
    const receivedQty = Number(item.receivedQty ?? 0) > 0 ? Number(item.receivedQty) : returnQty;
    return {
      id: item.id,
      materialName: getItemName(item),
      materialCode: getItemCode(item),
      unit: getSaleReturnItemUnit(item),
      returnQty,
      receivedQtyText: String(receivedQty),
      hasBatchTracking:
        item.material?.hasBatchTracking ??
        item.sourceDeliveryItem?.material?.hasBatchTracking ??
        false,
      disposition: toReceiveDisposition(item.disposition),
      batchNo: item.batchNo ?? '',
      storageLocation: item.storageLocationSnapshot ?? '',
      remarks: item.remarks ?? '',
    };
  });
}

export function ReceiveSaleReturnModal({
  visible,
  isIndependentReturn,
  items,
  loading,
  onClose,
  onSubmit,
}: ReceiveSaleReturnModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const inputFontSize = useScaledFontSize(FontSize.base);
  const [lines, setLines] = useState<ReceiveDraftLine[]>(() => buildDraftLines(items));

  useEffect(() => {
    if (visible) {
      setLines(buildDraftLines(items));
    }
  }, [items, visible]);

  const updateLine = (id: string, patch: Partial<ReceiveDraftLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const handleConfirm = () => {
    const payload: ReceiveSaleReturnItemDto[] = [];
    for (const line of lines) {
      const receivedQty = Number(line.receivedQtyText);
      if (!Number.isFinite(receivedQty) || receivedQty < 0) {
        toast.error(`请输入「${line.materialName}」的有效实收数量`);
        return;
      }
      if (receivedQty - line.returnQty > 0.000001) {
        toast.error(`「${line.materialName}」实收数量不能超过申请退货数量`);
        return;
      }
      if (
        receivedQty > 0 &&
        line.disposition !== ReceiveSaleReturnItemDto.disposition.REJECT_TO_CUSTOMER &&
        line.hasBatchTracking &&
        !line.batchNo.trim()
      ) {
        toast.error(`「${line.materialName}」启用了批号追踪，请填写批号`);
        return;
      }
      payload.push({
        id: line.id,
        receivedQty,
        disposition: line.disposition,
        batchNo: line.batchNo.trim() || undefined,
        storageLocation: line.storageLocation.trim() || undefined,
        remarks: line.remarks.trim() || undefined,
      });
    }
    onSubmit(payload);
  };

  return (
    <FullScreenModal
      visible={visible}
      title="确认退货收货"
      subtitle={
        isIndependentReturn
          ? '实收数量会生成退货入库流水。本单只登记退回实物，不处理应收或退款。'
          : '实收数量会生成退货入库流水；财务处理以退货单上的财务动作和财务单据为准。'
      }
      onClose={onClose}
      confirmText="确认收货"
      onConfirm={handleConfirm}
      loading={loading}
      avoidKeyboard
    >
      <View style={styles.list}>
        {lines.map((line) => (
          <View
            key={line.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                <Text style={[styles.name, { color: colors.text }]}>{line.materialName}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {line.materialCode}
                </Text>
              </View>
              <Text style={[styles.qtyHint, { color: colors.textSecondary }]}>
                申请 {formatQtyWithUnit(line.returnQty, line.unit, unitLabelMap)}
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>处置方式</Text>
            <View style={styles.chipRow}>
              {RECEIVE_DISPOSITION_OPTIONS.map((opt) => {
                const active = line.disposition === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateLine(line.id, { disposition: opt.value })}
                    style={[
                      styles.chip,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.primary : colors.textSecondary,
                        fontSize: FontSize.xs,
                        fontWeight: active ? '700' : '400',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>实收数量</Text>
            <TextInput
              value={line.receivedQtyText}
              onChangeText={(value) => updateLine(line.id, { receivedQtyText: value })}
              keyboardType="decimal-pad"
              numberOfLines={1}
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontSize: inputFontSize,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
            />

            <ScanInput
              label="批号"
              required={Boolean(
                line.hasBatchTracking &&
                Number(line.receivedQtyText) > 0 &&
                line.disposition !== ReceiveSaleReturnItemDto.disposition.REJECT_TO_CUSTOMER,
              )}
              value={line.batchNo}
              onChangeText={(value) => updateLine(line.id, { batchNo: value })}
              placeholder="扫码或输入批号"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>存放位置</Text>
            <TextInput
              value={line.storageLocation}
              onChangeText={(value) => updateLine(line.id, { storageLocation: value })}
              numberOfLines={1}
              style={[
                styles.input,
                {
                  color: colors.text,
                  fontSize: inputFontSize,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>备注</Text>
            <TextInput
              value={line.remarks}
              onChangeText={(value) => updateLine(line.id, { remarks: value })}
              multiline
              style={[
                styles.input,
                styles.remarkInput,
                {
                  color: colors.text,
                  fontSize: inputFontSize,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  titleWrap: { flex: 1 },
  name: { fontSize: FontSize.base, fontWeight: '700' },
  meta: { fontSize: FontSize.xs, marginTop: 2 },
  qtyHint: { fontSize: FontSize.xs },
  label: { fontSize: FontSize.xs, marginTop: Spacing.sm, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  remarkInput: { minHeight: 72, textAlignVertical: 'top' },
});
