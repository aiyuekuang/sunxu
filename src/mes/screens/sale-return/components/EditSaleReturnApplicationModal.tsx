import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SaleReturnItemInputDto } from '../../../types/models/SaleReturnItemInputDto';
import { getSaleReturnItemUnit, type SaleReturnItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import {
  buildCustomFieldFormPayload,
  CustomFieldFormSection,
  validateCustomFields,
} from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import { readCustomFieldValues } from '../../../components/custom-fields/formatCustomFieldValue.ts';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import type { SaleReturnDeductionLineInputDto } from '../../../types/models/SaleReturnDeductionLineInputDto';
import {
  ReturnDeductionLinesSection,
  type ReturnDeductionLineDraft,
  buildReturnDeductionLinePayload,
  validateReturnDeductionLines,
} from '../../../components/returns/ReturnDeductionLinesSection.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useScaledFontSize } from '../../../../core/theme/font-scale';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

interface EditDraftLine {
  key: string;
  id: string;
  materialId: string;
  sourceDeliveryItemId?: string;
  materialName: string;
  materialCode: string;
  unit: string;
  returnQtyText: string;
  batchNo: string;
  locationId?: string;
  storageLocation: string;
  disposition?: SaleReturnItemInputDto.disposition;
  financialAction?: SaleReturnItemInputDto.financialAction;
  remarks: string;
  customValues: Record<string, unknown>;
}

interface EditSaleReturnApplicationModalProps {
  visible: boolean;
  items: SaleReturnItem[];
  reasonCode?: string | null;
  deductionLines?: Array<{
    id: string;
    deductionItemCode: string;
    amount: number;
    basis?: string | null;
    remarks?: string | null;
  }>;
  priceVisible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (
    reasonCode: string,
    items: SaleReturnItemInputDto[],
    deductionLines: SaleReturnDeductionLineInputDto[],
  ) => void;
}

function getItemName(item: SaleReturnItem): string {
  return item.material?.name ?? item.sourceDeliveryItem?.material?.name ?? '未知物料';
}

function getItemCode(item: SaleReturnItem): string {
  return item.material?.code ?? item.sourceDeliveryItem?.material?.code ?? '-';
}

function toDisposition(value?: string | null): SaleReturnItemInputDto.disposition | undefined {
  switch (value) {
    case SaleReturnItemInputDto.disposition.RESELLABLE:
      return SaleReturnItemInputDto.disposition.RESELLABLE;
    case SaleReturnItemInputDto.disposition.PENDING:
      return SaleReturnItemInputDto.disposition.PENDING;
    case SaleReturnItemInputDto.disposition.DEFECTIVE:
      return SaleReturnItemInputDto.disposition.DEFECTIVE;
    case SaleReturnItemInputDto.disposition.SCRAP:
      return SaleReturnItemInputDto.disposition.SCRAP;
    case SaleReturnItemInputDto.disposition.REWORK:
      return SaleReturnItemInputDto.disposition.REWORK;
    case SaleReturnItemInputDto.disposition.REJECT_TO_CUSTOMER:
      return SaleReturnItemInputDto.disposition.REJECT_TO_CUSTOMER;
    default:
      return undefined;
  }
}

function toFinancialAction(
  value?: string | null,
): SaleReturnItemInputDto.financialAction | undefined {
  switch (value) {
    case SaleReturnItemInputDto.financialAction.NONE:
      return SaleReturnItemInputDto.financialAction.NONE;
    case SaleReturnItemInputDto.financialAction.CREDIT_NOTE:
      return SaleReturnItemInputDto.financialAction.CREDIT_NOTE;
    case SaleReturnItemInputDto.financialAction.RECEIVABLE_OFFSET:
      return SaleReturnItemInputDto.financialAction.RECEIVABLE_OFFSET;
    case SaleReturnItemInputDto.financialAction.REFUND:
      return SaleReturnItemInputDto.financialAction.REFUND;
    default:
      return undefined;
  }
}

function buildDraftLines(items: SaleReturnItem[]): EditDraftLine[] {
  return items.map((item) => ({
    key: item.id,
    id: item.id,
    materialId: item.materialId,
    sourceDeliveryItemId: item.sourceDeliveryItemId ?? undefined,
    materialName: getItemName(item),
    materialCode: getItemCode(item),
    unit: getSaleReturnItemUnit(item),
    returnQtyText: String(Number(item.returnQty ?? 0)),
    batchNo: item.batchNo ?? '',
    locationId: item.locationId ?? undefined,
    storageLocation: item.storageLocationSnapshot ?? '',
    disposition: toDisposition(item.disposition),
    financialAction: toFinancialAction(item.financialAction),
    remarks: item.remarks ?? '',
    customValues: readCustomFieldValues(item),
  }));
}

export function EditSaleReturnApplicationModal({
  visible,
  items,
  reasonCode: initialReasonCode,
  deductionLines: initialDeductionLines,
  priceVisible,
  loading,
  onClose,
  onSubmit,
}: EditSaleReturnApplicationModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const inputFontSize = useScaledFontSize(FontSize.base);
  const [lines, setLines] = useState<EditDraftLine[]>(() => buildDraftLines(items));
  const [reasonCode, setReasonCode] = useState(initialReasonCode ?? '');
  const [deductionLines, setDeductionLines] = useState<ReturnDeductionLineDraft[]>([]);
  const [customFieldErrors, setCustomFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const customFieldSchema = useCustomFieldSchema('sale_return_item');
  const { options: returnReasonOptions } = useDict('sale_return_reason');

  useEffect(() => {
    if (visible) {
      setLines(buildDraftLines(items));
      setReasonCode(initialReasonCode ?? '');
      setDeductionLines(
        (initialDeductionLines ?? []).map((line) => ({
          key: line.id,
          deductionItemCode: line.deductionItemCode,
          basis: line.basis ?? '',
          amount: String(line.amount),
          remarks: line.remarks ?? '',
        })),
      );
      setCustomFieldErrors({});
    }
  }, [initialDeductionLines, initialReasonCode, items, visible]);

  const updateLine = (key: string, patch: Partial<EditDraftLine>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const removeLine = (key: string) => {
    setLines((current) => {
      if (current.length <= 1) {
        toast.error('至少保留一条退货明细');
        return current;
      }
      return current.filter((line) => line.key !== key);
    });
  };

  const handleConfirm = () => {
    if (lines.length === 0) {
      toast.error('退货明细不能为空');
      return;
    }
    if (customFieldSchema.loading || customFieldSchema.loadError) {
      toast.info('销售退货明细自定义字段尚未成功加载，请稍后重试');
      return;
    }
    if (!reasonCode) {
      toast.error('请选择退货原因');
      return;
    }
    const deductionError = priceVisible ? validateReturnDeductionLines(deductionLines) : null;
    if (deductionError) {
      toast.error(deductionError);
      return;
    }

    const isSourceLinked = lines.some((line) => Boolean(line.sourceDeliveryItemId));
    const payload: SaleReturnItemInputDto[] = [];
    const nextCustomFieldErrors: Record<string, Record<string, string>> = {};
    for (const line of lines) {
      const fieldErrors = validateCustomFields(
        customFieldSchema.fields,
        line.customValues,
        'update',
      );
      if (Object.keys(fieldErrors).length > 0) nextCustomFieldErrors[line.key] = fieldErrors;
      const returnQty = Number(line.returnQtyText);
      if (!Number.isFinite(returnQty) || returnQty <= 0) {
        toast.error(`请输入「${line.materialName}」的有效申请退货数量`);
        return;
      }
      payload.push({
        id: line.id,
        ...(isSourceLinked
          ? { sourceDeliveryItemId: line.sourceDeliveryItemId }
          : { materialId: line.materialId }),
        returnQty,
        batchNo: line.batchNo.trim() || undefined,
        locationId: line.locationId || undefined,
        storageLocation: line.storageLocation.trim() || undefined,
        disposition: line.disposition,
        financialAction: line.financialAction,
        ...buildCustomFieldFormPayload(
          customFieldSchema.fields,
          customFieldSchema.schemaVersion,
          line.customValues,
        ),
        remarks: line.remarks.trim() || undefined,
      });
    }
    setCustomFieldErrors(nextCustomFieldErrors);
    if (Object.keys(nextCustomFieldErrors).length > 0) {
      toast.error('请完善销售退货明细自定义字段');
      return;
    }
    onSubmit(
      reasonCode,
      payload,
      priceVisible ? buildReturnDeductionLinePayload(deductionLines) : [],
    );
  };

  return (
    <FullScreenModal
      visible={visible}
      title="编辑"
      subtitle="只调整申请退货明细；已提交后需先撤回到草稿。"
      onClose={onClose}
      confirmText="保存"
      onConfirm={handleConfirm}
      loading={loading}
      avoidKeyboard
    >
      <PickerField
        label="退货原因"
        value={reasonCode}
        options={returnReasonOptions}
        onChange={setReasonCode}
        placeholder="请选择退货原因"
        required
      />
      {priceVisible ? (
        <ReturnDeductionLinesSection lines={deductionLines} onChange={setDeductionLines} />
      ) : null}
      <View style={styles.list}>
        {lines.map((line) => (
          <View
            key={line.key}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                <Text style={[styles.name, { color: colors.text }]}>{line.materialName}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {line.materialCode}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.error }]}
                onPress={() => removeLine(line.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.deleteText, { color: colors.error }]}>删除</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>
              申请退货数量{line.unit ? `（${formatUnitLabel(line.unit, unitLabelMap)}）` : ''}
            </Text>
            <TextInput
              value={line.returnQtyText}
              onChangeText={(value) => updateLine(line.key, { returnQtyText: value })}
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
            <CustomFieldFormSection
              fields={customFieldSchema.fields}
              values={line.customValues}
              errors={customFieldErrors[line.key] ?? {}}
              mode="update"
              loading={customFieldSchema.loading}
              loadError={customFieldSchema.loadError}
              showSection={false}
              onChange={(fieldKey, value) =>
                updateLine(line.key, {
                  customValues: { ...line.customValues, [fieldKey]: value },
                })
              }
            />
            <Text style={[styles.qtyHint, { color: colors.textSecondary }]}>
              当前 {formatQtyWithUnit(Number(line.returnQtyText || 0), line.unit, unitLabelMap)}
            </Text>

            <ScanInput
              label="批号"
              value={line.batchNo}
              onChangeText={(value) => updateLine(line.key, { batchNo: value })}
              placeholder="扫码或输入批号"
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>存放位置</Text>
            <TextInput
              value={line.storageLocation}
              onChangeText={(value) => updateLine(line.key, { storageLocation: value })}
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
              onChangeText={(value) => updateLine(line.key, { remarks: value })}
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
  deleteButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  deleteText: { fontSize: FontSize.xs, fontWeight: '700' },
  qtyHint: { fontSize: FontSize.xs, marginTop: 4 },
  label: { fontSize: FontSize.xs, marginTop: Spacing.sm, marginBottom: 4 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  remarkInput: { minHeight: 72, textAlignVertical: 'top' },
});
