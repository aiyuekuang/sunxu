import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FormField, FormSwitch } from '../../../core/components/FormField.tsx';
import { FontSize, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import {
  calculateCommercialLineAmounts,
  formatCommercialNumberInput,
} from '../../utils/commercial-line';
import { formatAmount } from '../../../core/utils/format';

export interface CommercialLineFieldsValue {
  quantity: number | string | null | undefined;
  unitPrice: number | string | null | undefined;
  discountRate?: number | string | null;
  taxRate?: number | string | null;
  priceIncludesTax?: boolean | null;
}

interface CommercialLineFieldsProps {
  value: CommercialLineFieldsValue;
  onChange: (patch: Partial<CommercialLineFieldsValue>) => void;
  unitPriceLabel?: string;
}

export const CommercialLineFields = React.memo(function CommercialLineFields({
  value,
  onChange,
  unitPriceLabel = '单价 (¥)',
}: CommercialLineFieldsProps) {
  const { colors } = useTheme();
  const amounts = calculateCommercialLineAmounts(value);

  return (
    <>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <FormField
            label={unitPriceLabel}
            value={formatCommercialNumberInput(value.unitPrice)}
            onChangeText={(text) => onChange({ unitPrice: text })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputWrap}>
          <FormField
            label="折扣率(%)"
            value={formatCommercialNumberInput(value.discountRate)}
            onChangeText={(text) => onChange({ discountRate: text })}
            placeholder="100"
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <FormField
            label="税率(%)"
            value={formatCommercialNumberInput(value.taxRate)}
            onChangeText={(text) => onChange({ taxRate: text })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.inputWrap}>
          <FormSwitch
            label="单价含税"
            value={value.priceIncludesTax === true}
            onValueChange={(checked) => onChange({ priceIncludesTax: checked })}
          />
        </View>
      </View>
      {amounts.totalAmount != null && (
        <Text style={[styles.preview, { color: colors.primary }]}>
          小计: {formatAmount(amounts.totalAmount)}
        </Text>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  preview: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
});
