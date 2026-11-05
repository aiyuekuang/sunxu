import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { CustomFieldFormSection } from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import type { CustomFieldSchemaState } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import type { FieldHelpContent } from '../../../../core/components/FormLabel.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  createExpenseBillLineDraft,
  type ExpenseBillLineDraft,
  getExpenseBillLineTotal,
} from '../utils/expense-bill-form';

interface ExpenseBillLineEditorProps {
  lines: ExpenseBillLineDraft[];
  categoryOptions: PickerOption[];
  error?: string;
  onChange: (lines: ExpenseBillLineDraft[]) => void;
  onClearError: (key: string) => void;
  customFieldSchema: CustomFieldSchemaState;
  customFieldValueLoadError?: string | null;
  customFieldErrors: Record<string, Record<string, string>>;
}

const EXPENSE_CATEGORY_HELP: FieldHelpContent = {
  purpose: '明确该笔费用的业务归属并决定会计科目',
  note: '采购附加费用类需走到岸成本分摊，普通费用单不可用',
};

export function ExpenseBillLineEditor({
  lines,
  categoryOptions,
  error,
  onChange,
  onClearError,
  customFieldSchema,
  customFieldValueLoadError,
  customFieldErrors,
}: ExpenseBillLineEditorProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
  const total = getExpenseBillLineTotal(lines);

  const updateLine = (key: string, patch: Partial<ExpenseBillLineDraft>) => {
    onClearError('lines');
    onChange(lines.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const removeLine = (key: string) => {
    onClearError('lines');
    const next = lines.filter((line) => line.key !== key);
    onChange(next.length > 0 ? next : [createExpenseBillLineDraft()]);
  };

  const addLine = () => {
    onClearError('lines');
    onChange([...lines, createExpenseBillLineDraft()]);
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => (
        <View
          key={line.key}
          style={[
            styles.lineBox,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <View style={styles.lineHeader}>
            <Text style={[styles.lineTitle, { color: colors.text }]}>明细 {index + 1}</Text>
            {lines.length > 1 && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => removeLine(line.key)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <PickerField
            label="费用类别"
            required
            value={line.categoryId}
            options={categoryOptions}
            onChange={(value) => updateLine(line.key, { categoryId: value || undefined })}
            placeholder="请选择费用类别"
            help={EXPENSE_CATEGORY_HELP}
          />

          <FormField
            label="金额"
            required
            value={line.amount}
            onChangeText={(value) => updateLine(line.key, { amount: value })}
            keyboardType="decimal-pad"
            placeholder="请输入金额"
          />

          <FormField
            label="费用说明"
            value={line.description ?? ''}
            onChangeText={(value) => updateLine(line.key, { description: value })}
            placeholder="可选填写费用用途"
          />
          <CustomFieldFormSection
            fields={customFieldSchema.fields}
            values={line.customValues ?? {}}
            errors={customFieldErrors[line.key] ?? {}}
            mode={line.id ? 'update' : 'create'}
            loading={customFieldSchema.loading}
            loadError={customFieldValueLoadError ?? customFieldSchema.loadError}
            showSection={false}
            onChange={(fieldKey, value) =>
              updateLine(line.key, {
                customValues: { ...(line.customValues ?? {}), [fieldKey]: value },
              })
            }
          />
        </View>
      ))}

      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.primary }]}
          onPress={addLine}
          activeOpacity={0.7}
        >
          <Ionicons name="add-outline" size={18} color={colors.primary} />
          <Text style={[styles.addText, { color: colors.primary }]}>添加明细</Text>
        </TouchableOpacity>
        <Text style={[styles.totalText, { color: colors.text }]}>
          合计 {mask(`¥${total.toFixed(2)}`)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  lineBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  totalText: {
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
});
