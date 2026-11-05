import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ProductionTrendItemDto } from '../../../host/contracts/generated/models/ProductionTrendItemDto.d.ts';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';
import { ResponsiveTrendChart } from './ResponsiveTrendChart.tsx';
import { splitTrendByUnit } from './report-unit-trend.ts';

interface DashboardHourlyProductionChartProps {
  trend: ProductionTrendItemDto[];
}

export function DashboardHourlyProductionChart({ trend }: DashboardHourlyProductionChartProps) {
  const { colors } = useTheme();
  const series = useMemo(
    () =>
      splitTrendByUnit(trend, (label, index, total) =>
        index === 0 || index === total - 1 || index % 4 === 0 ? label.replace(':00', '') : '',
      ),
    [trend],
  );

  return (
    <>
      <ReportSectionHeader
        title="今日产量趋势"
        hint="按工单可交付产量统计；不同单位分开展示 · 最多延迟 30 秒更新"
        action={
          <View style={styles.legend}>
            <View style={[styles.legendMark, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>小时</Text>
            <View style={[styles.legendLine, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>累计</Text>
          </View>
        }
      />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {trend.length > 0 ? (
          series.length > 0 ? (
            series.map((item) => (
              <View key={item.seriesId} style={styles.series}>
                <View style={styles.totalRow}>
                  <Text
                    style={[styles.totalLabel, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    今日累计 · {item.label}
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    {formatCompactNumber(item.total)}
                    {item.unit ? ` ${item.unit}` : ''}
                  </Text>
                </View>
                <ResponsiveTrendChart
                  points={item.points}
                  mode="hourly"
                  accessibilityLabel={`今日${item.label}每小时报工产量与累计产量，当前累计 ${formatCompactNumber(item.total)}${item.unit ?? ''}`}
                />
                {item.total === 0 ? (
                  <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                    当前暂无{item.label}可交付产量
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.series}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>今日累计</Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>0</Text>
              </View>
              <ResponsiveTrendChart
                points={trend.map((item, index) => ({
                  label: item.label,
                  value: 0,
                  axisLabel:
                    index === 0 || index === trend.length - 1 || index % 4 === 0
                      ? item.label.replace(':00', '')
                      : '',
                }))}
                mode="hourly"
                accessibilityLabel="今日每小时产量与累计产量，当前尚无可交付产量"
              />
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                当前暂无可交付产量
              </Text>
            </View>
          )
        ) : (
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>今日趋势暂不可用</Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  series: { gap: Spacing.xs },
  legend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  legendMark: { width: 8, height: 8, borderRadius: Radius.full },
  legendLine: { width: 12, height: 2, borderRadius: Radius.full, marginLeft: Spacing.xs },
  legendText: { fontSize: FontSize.xs },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs },
  totalLabel: { fontSize: FontSize.xs },
  totalValue: { fontSize: FontSize.lg, fontWeight: '700' },
  emptyHint: { fontSize: FontSize.xs, textAlign: 'center' },
});
