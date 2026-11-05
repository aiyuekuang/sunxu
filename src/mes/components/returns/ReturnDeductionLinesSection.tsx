import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FormField } from '../../../core/components/FormField.tsx';
import { FormSection } from '../../../core/components/FormPage.tsx';
import { PickerField } from '../../../core/components/PickerField.tsx';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useDict } from '../../host/hooks/useDict';
import { useTheme } from '../../../core/theme/useTheme';
import { formatAmount } from '../../../core/utils/format';

export interface ReturnDeductionLineDraft {
  key: string;
  deductionItemCode: string;
  basis: string;
  amount: string;
  remarks: string;
}

interface ReturnDeductionLinesSectionProps {
  lines: ReturnDeductionLineDraft[];
  onChange: (lines: ReturnDeductionLineDraft[]) => void;
}

export function ReturnDeductionLinesSection({ lines, onChange }: ReturnDeductionLinesSectionProps) {
  const { colors } = useTheme();
  const { options } = useDict('deduction_item');
  const total = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [lines],
  );

  const update = (key: string, patch: Partial<ReturnDeductionLineDraft>) => {
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  return (
    <FormSection title="协商扣款">
      {lines.map((line, index) => (
        <View
          key={line.key}
          style={[
            styles.card,
            { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>扣款 {index + 1}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`删除扣款 ${index + 1}`}
              onPress={() => onChange(lines.filter((item) => item.key !== line.key))}
              hitSlop={styles.hitSlop}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
          <PickerField
            label="扣款项目"
            required
            value={line.deductionItemCode}
            options={options}
            onChange={(deductionItemCode) => update(line.key, { deductionItemCode })}
            placeholder="请选择扣款项目"
          />
          <FormField
            label="计算依据"
            value={line.basis}
            onChangeText={(basis) => update(line.key, { basis })}
            placeholder="选填"
          />
          <FormField
            label="金额（元）"
            required
            value={line.amount}
            onChangeText={(amount) => update(line.key, { amount })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <FormField
            label="备注"
            value={line.remarks}
            onChangeText={(remarks) => update(line.key, { remarks })}
            placeholder="选填"
          />
        </View>
      ))}
      <TouchableOpacity
        accessibilityRole="button"
        style={[styles.addButton, { borderColor: colors.border }]}
        onPress={() =>
          onChange([
            ...lines,
            {
              key: `${Date.now()}-${lines.length}`,
              deductionItemCode: '',
              basis: '',
              amount: '',
              remarks: '',
            },
          ])
        }
        activeOpacity={0.75}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
        <Text style={[styles.addText, { color: colors.primary }]}>添加扣款行</Text>
      </TouchableOpacity>
      {lines.length > 0 ? (
        <Text style={[styles.total, { color: colors.textSecondary }]}>
          扣款合计 {formatAmount(total)} 元
        </Text>
      ) : null}
    </FormSection>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize.sm, fontWeight: '600' },
  addButton: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addText: { fontSize: FontSize.sm, fontWeight: '600' },
  total: { fontSize: FontSize.sm, textAlign: 'right' },
  hitSlop: { top: 8, right: 8, bottom: 8, left: 8 },
});

export function validateReturnDeductionLines(lines: ReturnDeductionLineDraft[]): string | null {
  for (const [index, line] of lines.entries()) {
    if (!line.deductionItemCode) return `请选择第 ${index + 1} 行扣款项目`;
    const amount = Number(line.amount);
    if (!Number.isFinite(amount) || amount <= 0) return `请输入第 ${index + 1} 行大于 0 的扣款金额`;
  }
  return null;
}

export function buildReturnDeductionLinePayload(lines: ReturnDeductionLineDraft[]) {
  return lines.map((line) => ({
    deductionItemCode: line.deductionItemCode,
    amount: Number(line.amount),
    basis: line.basis.trim() || undefined,
    remarks: line.remarks.trim() || undefined,
  }));
}
