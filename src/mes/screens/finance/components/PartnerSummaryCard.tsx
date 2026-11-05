import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { FinanceInvoiceType, PartnerSummary } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { getFinanceInvoiceVisualConfig } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

interface PartnerSummaryCardProps {
  item: PartnerSummary;
  type: FinanceInvoiceType;
  onPress: () => void;
}

export const PartnerSummaryCard = React.memo(function PartnerSummaryCard({
  item,
  type,
  onPress,
}: PartnerSummaryCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
  const visual = getFinanceInvoiceVisualConfig(type);

  const fmt = (value: number) => mask(`¥${Number(value ?? 0).toFixed(2)}`);

  return (
    <ListCard onPress={onPress} style={[styles.card, { borderLeftColor: visual.accentColor }]}>
      <ListCard.Header>
        <ListCard.Code>{item.partnerCode}</ListCard.Code>
        <Text style={[styles.netBalance, { color: visual.accentColor }]}>
          {fmt(item.netBalance)}
        </Text>
      </ListCard.Header>
      <ListCard.Title>{item.partnerName}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>
          {visual.amountLabel} {fmt(item.totalInvoiced)}
        </ListCard.MetaText>
        <ListCard.MetaText color={colors.success}>
          {visual.settledLabel} {fmt(item.totalPaid)}
        </ListCard.MetaText>
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>
          {visual.residualLabel} {fmt(item.balance)}
        </ListCard.MetaText>
        {item.openCreditAmount > 0 ? (
          <View style={[styles.creditPill, { backgroundColor: colors.warningLight }]}>
            <Text style={[styles.creditText, { color: colors.warning }]}>
              信用余额 {fmt(item.openCreditAmount)}
            </Text>
          </View>
        ) : null}
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>贷项抵减 {fmt(item.creditNoteAmount)}</ListCard.MetaText>
        <ListCard.MetaText color={item.overdueCount > 0 ? colors.error : colors.textSecondary}>
          逾期 {item.overdueCount} 笔
        </ListCard.MetaText>
      </ListCard.Meta>
      {item.lastDocumentDate ? (
        <ListCard.Meta>
          <ListCard.MetaText color={colors.textSecondary}>
            最近单据 {formatDate(item.lastDocumentDate)}
          </ListCard.MetaText>
        </ListCard.Meta>
      ) : null}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
  },
  netBalance: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  creditPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  creditText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
