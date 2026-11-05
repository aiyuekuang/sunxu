import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { CashAdvance } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { FUNDS_ADVANCE_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

interface CashAdvanceCardProps {
  item: CashAdvance;
  onPress: () => void;
}

export const CashAdvanceCard = React.memo(function CashAdvanceCard({
  item,
  onPress,
}: CashAdvanceCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
  const amount = Number(item.amount) || 0;
  const settledAmount = Number(item.settledAmount) || 0;
  const remainingAmount = Math.max(amount - settledAmount, 0);

  return (
    <ListCard onPress={onPress} style={[styles.card, { borderLeftColor: colors.primary }]}>
      <ListCard.Header>
        <ListCard.Code>{item.advanceNo}</ListCard.Code>
        <ConfigBadge value={item.status} config={FUNDS_ADVANCE_STATUS_CONFIG} size="sm" />
      </ListCard.Header>
      <ListCard.Title>{item.counterpartyName || '未指定借支对象'}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText color={colors.primary}>
          借支 {mask(`¥${amount.toFixed(2)}`)}
        </ListCard.MetaText>
        {settledAmount > 0 && (
          <View style={[styles.settledPill, { backgroundColor: colors.successSurface }]}>
            <Text style={[styles.settledText, { color: colors.success }]}>
              已还 {mask(`¥${settledAmount.toFixed(2)}`)}
            </Text>
          </View>
        )}
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>业务日期 {formatDate(item.bizDate)}</ListCard.MetaText>
        <ListCard.MetaText>未还 {mask(`¥${remainingAmount.toFixed(2)}`)}</ListCard.MetaText>
      </ListCard.Meta>
      {item.reason && <ListCard.Subtitle>{item.reason}</ListCard.Subtitle>}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
  },
  settledPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  settledText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
