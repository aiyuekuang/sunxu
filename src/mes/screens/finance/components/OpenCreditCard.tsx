import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { OpenCreditRow } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { FINANCE_PAYMENT_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

interface OpenCreditCardProps {
  item: OpenCreditRow;
  selected?: boolean;
  onPress?: () => void;
}

export const OpenCreditCard = React.memo(function OpenCreditCard({
  item,
  selected = false,
  onPress,
}: OpenCreditCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay();
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
        <ListCard.Code>{item.documentNo}</ListCard.Code>
        <View style={styles.headerBadges}>
          {item.sourceType === 'credit_note' ? (
            <View style={[styles.sourcePill, { backgroundColor: colors.errorSurface }]}>
              <Text style={[styles.sourceText, { color: colors.error }]}>贷项通知</Text>
            </View>
          ) : null}
          {item.sourceType === 'credit_note' ? (
            <View style={[styles.sourcePill, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.sourceText, { color: colors.warning }]}>
                {item.direction === 'receive' ? '可抵应收' : '可抵应付'}
              </Text>
            </View>
          ) : (
            <ConfigBadge value={item.direction} config={FINANCE_PAYMENT_TYPE_CONFIG} />
          )}
        </View>
      </ListCard.Header>
      <ListCard.Title>{item.partnerName}</ListCard.Title>
      <ListCard.Meta>
        <ListCard.MetaText>原始金额 {fmt(item.creditAmount)}</ListCard.MetaText>
        <View style={[styles.availablePill, { backgroundColor: colors.warningLight }]}>
          <Text style={[styles.availableText, { color: colors.warning }]}>
            可用 {fmt(item.availableAmount)}
          </Text>
        </View>
      </ListCard.Meta>
      <ListCard.Meta>
        <ListCard.MetaText color={colors.textSecondary}>
          单据日期 {formatDate(item.documentDate)}
        </ListCard.MetaText>
        {item.referenceNo ? (
          <ListCard.MetaText color={colors.textSecondary}>
            参考号 {item.referenceNo}
          </ListCard.MetaText>
        ) : null}
      </ListCard.Meta>
      {item.description ? (
        <ListCard.Meta>
          <ListCard.MetaText color={colors.textSecondary}>{item.description}</ListCard.MetaText>
        </ListCard.Meta>
      ) : null}
    </ListCard>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sourcePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  sourceText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  availablePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  availableText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
