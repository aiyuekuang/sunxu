import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { PieceworkSummaryItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber, getNameInitial } from '../../../../core/utils/format';

interface PieceworkSummaryCardProps {
  item: PieceworkSummaryItem;
  mask: (text: string) => string;
  onPress: () => void;
}

function PieceworkSummaryCardInner({ item, mask, onPress }: PieceworkSummaryCardProps) {
  const { colors } = useTheme();
  const assigneeName = item.assigneeName || '未知';

  return (
    <ListCard
      onPress={onPress}
      accessibilityLabel={`${assigneeName}，${item.workOrderCount} 个工单，计件工资 ${mask(`¥${item.totalWage.toFixed(2)}`)}`}
      accessibilityHint="打开人员计件明细"
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {getNameInitial(assigneeName)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{assigneeName}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {item.workOrderCount} 个工单 · 合格{' '}
            {formatNumber(item.totalQty, { maximumFractionDigits: 4 })}
            {item.totalScrappedQty > 0
              ? ` · 报废 ${formatNumber(item.totalScrappedQty, { maximumFractionDigits: 4 })}`
              : ''}
            {item.totalTimeHours > 0 ? ` · 计时 ${item.totalTimeHours.toFixed(2)} h` : ''}
            {item.pendingWageCount > 0 ? ` · 待确认 ${item.pendingWageCount}` : ''}
          </Text>
        </View>
        <View style={styles.wageBox}>
          <Text style={[styles.wage, { color: colors.primary }]}>
            {mask(`¥${item.totalWage.toFixed(2)}`)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </ListCard>
  );
}

export const PieceworkSummaryCard = React.memo(PieceworkSummaryCardInner);

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: MIN_TOUCH_TARGET - Spacing.xs,
    height: MIN_TOUCH_TARGET - Spacing.xs,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700' },
  cardInfo: { flex: 1, gap: Spacing.xs, minWidth: 0 },
  name: { fontSize: FontSize.base, fontWeight: '600' },
  sub: { fontSize: FontSize.sm },
  wageBox: { alignItems: 'flex-end', maxWidth: '32%' },
  wage: { fontSize: FontSize.lg, fontWeight: '700', flexShrink: 1 },
});
