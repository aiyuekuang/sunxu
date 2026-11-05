import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ExpenseBill } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  FUNDS_EXPENSE_SCENE_CONFIG,
  FUNDS_EXPENSE_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

interface ExpenseBillCardProps {
  item: ExpenseBill;
  onPress: () => void;
}

export const ExpenseBillCard = React.memo(function ExpenseBillCard({
  item,
  onPress,
}: ExpenseBillCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
  const amount = Number(item.totalAmount) || 0;

  return (
    <ListCard onPress={onPress} style={[styles.card, { borderLeftColor: colors.warning }]}>
      <ListCard.Header>
        <ListCard.Code>{item.billNo}</ListCard.Code>
        <View style={styles.badges}>
          <ConfigBadge value={item.billScene} config={FUNDS_EXPENSE_SCENE_CONFIG} size="sm" />
          <ConfigBadge value={item.status} config={FUNDS_EXPENSE_STATUS_CONFIG} size="sm" />
        </View>
      </ListCard.Header>
      <ListCard.Title>{item.counterpartyName || '未指定往来对象'}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText color={colors.warning}>
          费用合计 {mask(`¥${amount.toFixed(2)}`)}
        </ListCard.MetaText>
        {item.status === 'paid' && (
          <View style={[styles.paidPill, { backgroundColor: colors.successSurface }]}>
            <Text style={[styles.paidText, { color: colors.success }]}>已付款</Text>
          </View>
        )}
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText>业务日期 {formatDate(item.bizDate)}</ListCard.MetaText>
        {item.currency && <ListCard.MetaText>{item.currency}</ListCard.MetaText>}
      </ListCard.Meta>
      {item.remark && <ListCard.Subtitle>{item.remark}</ListCard.Subtitle>}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 3,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  paidPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  paidText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
