import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { FinanceInvoice, FinanceInvoiceType } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { getFinanceInvoiceVisualConfig } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

interface ReconciliationInvoiceCardProps {
  item: FinanceInvoice;
  type: FinanceInvoiceType;
  selected: boolean;
  amount: string;
  onPress: () => void;
  onChangeAmount: (value: string) => void;
}

export const ReconciliationInvoiceCard = React.memo(function ReconciliationInvoiceCard({
  item,
  type,
  selected,
  amount,
  onPress,
  onChangeAmount,
}: ReconciliationInvoiceCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
  const visual = getFinanceInvoiceVisualConfig(type);

  const fmt = (value: number) => mask(`¥${Number(value ?? 0).toFixed(2)}`);

  return (
    <ListCard
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primarySurface : colors.surface,
        },
      ]}
    >
      <ListCard.Header>
        <ListCard.Code>{item.invoiceNo}</ListCard.Code>
        <Text style={[styles.residualText, { color: visual.accentColor }]}>
          {fmt(item.residualAmount)}
        </Text>
      </ListCard.Header>
      <ListCard.Meta>
        <ListCard.MetaText>单据金额 {fmt(item.amount)}</ListCard.MetaText>
        <ListCard.MetaText color={colors.textSecondary}>
          到期 {formatDate(item.dueDate)}
        </ListCard.MetaText>
      </ListCard.Meta>
      {selected ? (
        <View style={styles.amountRow}>
          <QuickNumInput
            label="本次核销"
            value={amount}
            onChangeText={onChangeAmount}
            placeholder="0"
            max={item.residualAmount}
            min={0}
            step={1}
            unit="元"
            hint={`最大 ${fmt(item.residualAmount)}`}
          />
        </View>
      ) : null}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  residualText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  amountRow: {
    marginTop: Spacing.sm,
  },
});
