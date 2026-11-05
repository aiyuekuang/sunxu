import { StyleSheet, View } from 'react-native';
import type { PurchaseReturnReturnableLineDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';

export interface PurchaseReturnSourceDraftItem {
  sourceReceiptItemId: string;
  returnQty: string;
}

interface PurchaseReturnSourceItemsSectionProps {
  lines: PurchaseReturnReturnableLineDto[];
  values: PurchaseReturnSourceDraftItem[];
  onChange: (sourceReceiptItemId: string, returnQty: string) => void;
}

export function PurchaseReturnSourceItemsSection({
  lines,
  values,
  onChange,
}: PurchaseReturnSourceItemsSectionProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const valueById = new Map(values.map((item) => [item.sourceReceiptItemId, item.returnQty]));

  return (
    <FormSection title="可退明细">
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        每行默认带出当前可退数量；填写 0 表示本行不退。
      </Text>
      {lines.map((line) => (
        <View
          key={line.sourceReceiptItemId}
          style={[
            styles.card,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.name, { color: colors.text }]}>
            {line.materialName ?? '未知物料'}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {line.materialCode ?? '-'} · 可退{' '}
            {formatQtyWithUnit(line.returnableQty, line.baseUnit, unitLabelMap)}
          </Text>
          {line.batchNo ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>批号: {line.batchNo}</Text>
          ) : null}
          <FormField
            label={`退货数量（${formatUnitLabel(line.baseUnit, unitLabelMap) || '基础单位'}）`}
            value={valueById.get(line.sourceReceiptItemId) ?? ''}
            onChangeText={(returnQty) => onChange(line.sourceReceiptItemId, returnQty)}
            placeholder={`不超过 ${formatNumber(line.returnableQty)}`}
            keyboardType="decimal-pad"
          />
        </View>
      ))}
    </FormSection>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  meta: { fontSize: FontSize.xs },
});
