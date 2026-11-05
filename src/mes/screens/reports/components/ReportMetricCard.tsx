import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { DashboardComparisonMetricDto } from '../../../types/models/DashboardComparisonMetricDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';
import { ReportMetricComparison } from './ReportMetricComparison.tsx';

export type ReportMetricTone = 'primary' | 'success' | 'warning' | 'error' | 'muted';

interface ReportMetricCardProps {
  label: string;
  value: number | string;
  variant?: 'tile' | 'compact' | 'summary';
  tone?: ReportMetricTone;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  hint?: string;
  comparison?: DashboardComparisonMetricDto;
}

function ReportMetricCardInner({
  label,
  value,
  variant = 'tile',
  tone = 'primary',
  icon,
  onPress,
  hint,
  comparison,
}: ReportMetricCardProps) {
  const { colors } = useTheme();
  const displayValue = typeof value === 'number' ? formatCompactNumber(value) : value;

  if (variant === 'summary') {
    return (
      <View style={styles.summaryMetric}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>{displayValue}</Text>
      </View>
    );
  }

  const toneColor = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    muted: colors.textSecondary,
  }[tone];
  if (variant === 'compact') {
    const compactContent = (
      <>
        <View style={styles.compactValueRow}>
          {icon ? (
            <View style={[styles.compactIconWrap, { backgroundColor: colors.primarySurface }]}>
              <Ionicons name={icon} size={14} color={toneColor} />
            </View>
          ) : null}
          <Text style={[styles.compactValue, { color: colors.text }]} numberOfLines={1}>
            {displayValue}
          </Text>
          {onPress ? (
            <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
          ) : null}
        </View>
        <Text style={[styles.compactLabel, { color: colors.textSecondary }]} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.compactHint, { color: colors.textSecondary }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
        {comparison ? <ReportMetricComparison comparison={comparison} /> : null}
      </>
    );

    if (!onPress) {
      return (
        <View style={[styles.compactCard, { backgroundColor: colors.surface }]}>
          {compactContent}
        </View>
      );
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: colors.surface },
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} ${displayValue}`}
        accessibilityHint={hint ?? '打开相关业务列表'}
      >
        {compactContent}
      </Pressable>
    );
  }

  const content = (
    <>
      <View style={styles.iconRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySurface }]}>
          {icon ? <Ionicons name={icon} size={16} color={toneColor} /> : null}
        </View>
        {onPress ? (
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        ) : null}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{displayValue}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text> : null}
      {comparison ? <ReportMetricComparison comparison={comparison} /> : null}
    </>
  );

  if (!onPress)
    return <View style={[styles.card, { backgroundColor: colors.surface }]}>{content}</View>;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${displayValue}`}
      accessibilityHint={hint ?? '打开相关业务列表'}
    >
      {content}
    </Pressable>
  );
}

export const ReportMetricCard = React.memo(ReportMetricCardInner);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 132,
    minHeight: MIN_TOUCH_TARGET * 3,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  compactCard: {
    flex: 1,
    minWidth: 132,
    minHeight: MIN_TOUCH_TARGET * 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    gap: 2,
    ...Shadow.sm,
  },
  compactValueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  compactIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactValue: { flex: 1, fontSize: FontSize.lg, lineHeight: FontSize.lg + 2, fontWeight: '700' },
  compactLabel: { fontSize: FontSize.xs, lineHeight: FontSize.xs + 3, fontWeight: '500' },
  compactHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs + 2 },
  summaryMetric: {
    width: '23%',
    minWidth: 0,
    gap: 2,
  },
  summaryLabel: { fontSize: FontSize.xs, lineHeight: 16, flexShrink: 1 },
  summaryValue: { fontSize: FontSize.base, lineHeight: 20, fontWeight: '700', flexShrink: 1 },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: MIN_TOUCH_TARGET - Spacing.xl,
    height: MIN_TOUCH_TARGET - Spacing.xl,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: FontSize.xl, fontWeight: '700', flexShrink: 1 },
  label: { fontSize: FontSize.xs, fontWeight: '500', flexShrink: 1 },
  hint: { fontSize: FontSize.xs, flexShrink: 1 },
  pressed: { opacity: 0.72 },
});
