import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { DashboardComparisonMetricDto } from '../../../types/models/DashboardComparisonMetricDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';
import { ReportMetricComparison } from './ReportMetricComparison.tsx';

interface ReportPeriodHeroProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  comparison?: DashboardComparisonMetricDto;
}

export function ReportPeriodHero({
  label,
  value,
  hint,
  icon,
  tone = 'primary',
  onPress,
  comparison,
}: ReportPeriodHeroProps) {
  const { colors } = useTheme();
  const toneColor = colors[tone];
  const displayValue = typeof value === 'number' ? formatCompactNumber(value) : value;

  return (
    <ListCard
      onPress={onPress}
      accessibilityLabel={`${label} ${displayValue}`}
      accessibilityHint={onPress ? '打开相关业务列表' : undefined}
      style={styles.card}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySurface }]}>
        <Ionicons name={icon} size={MIN_TOUCH_TARGET - Spacing.xl} color={toneColor} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.hint, { color: colors.textSecondary }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
        {comparison ? <ReportMetricComparison comparison={comparison} /> : null}
      </View>
      <Text style={[styles.value, { color: toneColor }]} numberOfLines={1}>
        {displayValue}
      </Text>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} /> : null}
    </ListCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  iconWrap: {
    width: MIN_TOUCH_TARGET - Spacing.xl,
    height: MIN_TOUCH_TARGET - Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  copy: { flex: 1, minWidth: 0, gap: Spacing.xs },
  value: {
    flexShrink: 1,
    maxWidth: '42%',
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    lineHeight: FontSize['3xl'] + Spacing.xs,
    textAlign: 'right',
  },
  label: { fontSize: FontSize.sm, fontWeight: '600' },
  hint: { fontSize: FontSize.xs },
});
