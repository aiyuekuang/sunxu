import { StyleSheet, View } from 'react-native';
import type { DashboardComparisonMetricDto } from '../../../types/models/DashboardComparisonMetricDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

interface ReportMetricComparisonProps {
  comparison: DashboardComparisonMetricDto;
}

function formatChange(
  value: number | null | undefined,
  unit: DashboardComparisonMetricDto['unit'],
): string {
  if (value === null || value === undefined) return '—';
  const sign = value > 0 ? '+' : '';
  const suffix = unit === 'percentage_point' ? ' 个百分点' : '%';
  return `${sign}${formatNumber(value, { maximumFractionDigits: 1 })}${suffix}`;
}

export function ReportMetricComparison({ comparison }: ReportMetricComparisonProps) {
  const { colors } = useTheme();
  const colorFor = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return colors.textSecondary;
    return value > 0 ? colors.success : colors.error;
  };

  return (
    <View style={styles.row} accessibilityLabel="同比和环比">
      <Text style={[styles.label, { color: colors.textTertiary }]}>同比</Text>
      <Text style={[styles.value, { color: colorFor(comparison.yoy) }]}>
        {formatChange(comparison.yoy, comparison.unit)}
      </Text>
      <Text style={[styles.label, { color: colors.textTertiary }]}>环比</Text>
      <Text style={[styles.value, { color: colorFor(comparison.mom) }]}>
        {formatChange(comparison.mom, comparison.unit)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: Spacing.xs,
    rowGap: Spacing.xs,
  },
  label: { fontSize: FontSize.xs },
  value: { fontSize: FontSize.xs, fontWeight: '600' },
});
