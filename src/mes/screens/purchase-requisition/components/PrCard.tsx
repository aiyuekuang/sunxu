import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PurchaseRequisition } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { PR_SOURCE_CONFIG, PR_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrCardProps {
  /** 采购申请单数据 */
  item: PurchaseRequisition;
  /** 点击卡片回调 */
  onPress: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PrCard = React.memo(function PrCard({ item, onPress }: PrCardProps) {
  const { colors } = useTheme();
  const sourceLabel = PR_SOURCE_CONFIG[item.sourceType]?.label ?? item.sourceType;
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.prNo, { color: colors.primary }]} numberOfLines={1}>
          {item.prNo}
        </Text>
        <ConfigBadge value={item.status} config={PR_STATUS_CONFIG} size="sm" />
      </View>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {sourceLabel} · {item.items?.length ?? 0} 个物料 · {formatDate(item.documentDate)}
      </Text>
      {item.remarks && (
        <Text style={[styles.remarks, { color: colors.textMuted }]} numberOfLines={1}>
          {item.remarks}
        </Text>
      )}
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prNo: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  meta: { fontSize: FontSize.xs },
  remarks: { fontSize: FontSize.xs },
});
