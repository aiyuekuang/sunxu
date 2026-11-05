import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { HOME_STAT_CONFIG } from '../../../constants/home-configs';
import { FontSize, MIN_TOUCH_TARGET_ANDROID, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  /** STAT_CONFIG 中的配置项 */
  cfg: (typeof HOME_STAT_CONFIG)[number];
  /** 统计数值 */
  value: number;
  /** 点击回调（如下钻到工单列表） */
  onPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const StatCard = React.memo(function StatCard({ cfg, value, onPress }: StatCardProps) {
  const { colors } = useTheme();
  const isAlert = cfg.key === 'overdue' && value > 0;
  const displayValue = formatCompactNumber(value);
  const iconColor = isAlert ? colors.error : cfg.color;

  return (
    <TouchableOpacity
      style={styles.statCard}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${cfg.label}：${displayValue}`}
      accessibilityState={{ disabled: !onPress }}
    >
      <Ionicons accessible={false} name={cfg.icon} size={16} color={iconColor} />
      <Text
        numberOfLines={1}
        style={[styles.statValue, { color: isAlert ? colors.error : colors.text }]}
      >
        {displayValue}
      </Text>
      <Text numberOfLines={1} style={[styles.statLabel, { color: colors.textSecondary }]}>
        {cfg.label}
      </Text>
    </TouchableOpacity>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  statValue: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs, fontWeight: '400' },
});
