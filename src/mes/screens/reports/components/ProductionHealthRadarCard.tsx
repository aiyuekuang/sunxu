import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';
import type { ProductionDeliveryMetricsDto } from '../../../types/models/ProductionDeliveryMetricsDto';
import type { ProductionOutputMetricsDto } from '../../../types/models/ProductionOutputMetricsDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber, formatNumber } from '../../../../core/utils/format';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';

interface ProductionHealthRadarCardProps {
  delivery: ProductionDeliveryMetricsDto;
  output: ProductionOutputMetricsDto;
}

interface Indicator {
  key: string;
  label: string;
  value: number | null;
  numerator: number;
  denominator: number;
}

export function ProductionHealthRadarCard({ delivery, output }: ProductionHealthRadarCardProps) {
  const { colors } = useTheme();
  const reportedQty = Number(output.reportedGoodQty ?? 0) + Number(output.reportedDefectQty ?? 0);
  const indicators = useMemo<Indicator[]>(
    () => [
      {
        key: 'delivery',
        label: '按期交付',
        value: delivery.onTimeDeliveryRate ?? null,
        numerator: Number(delivery.onTimeCompletedWorkOrders ?? 0),
        denominator: Number(delivery.deliveryEligibleWorkOrders ?? 0),
      },
      {
        key: 'achievement',
        label: '计划达成',
        value: output.achievementRate ?? null,
        numerator: Number(output.completedQty ?? 0),
        denominator: Number(output.plannedQty ?? 0),
      },
      {
        key: 'good',
        label: '报工良品',
        value: reportedQty > 0 ? (Number(output.reportedGoodQty ?? 0) / reportedQty) * 100 : null,
        numerator: Number(output.reportedGoodQty ?? 0),
        denominator: reportedQty,
      },
    ],
    [delivery, output, reportedQty],
  );
  const complete = indicators.every((indicator) => indicator.value !== null);
  const radarValues = indicators.map((indicator) =>
    Math.min(Math.max(Number(indicator.value ?? 0), 0), 100),
  );

  return (
    <>
      <ReportSectionHeader title="生产达成画像" hint="三项比例各按自身分母计算；雷达轴封顶 100%" />
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {complete ? (
          <View
            style={styles.radar}
            accessibilityRole="image"
            accessibilityLabel={`生产达成画像：${indicators
              .map((indicator) => `${indicator.label} ${formatNumber(Number(indicator.value))}%`)
              .join('，')}`}
          >
            <RadarChart
              data={radarValues}
              labels={indicators.map((indicator) => indicator.label)}
              dataLabels={radarValues.map((value) => `${formatNumber(value)}%`)}
              maxValue={100}
              noOfSections={4}
              chartSize={196}
              labelsPositionOffset={16}
              dataLabelsPositionOffset={8}
              labelConfig={{ fontSize: FontSize.xs, stroke: colors.textSecondary }}
              dataLabelsConfig={{ fontSize: FontSize.xs, stroke: colors.primary }}
              gridConfig={{ stroke: colors.borderLight, strokeWidth: 1, fill: 'transparent' }}
              polygonConfig={{
                stroke: colors.primary,
                strokeWidth: 2,
                fill: colors.primarySurface,
                opacity: 0.45,
              }}
            />
          </View>
        ) : (
          <EmptyState compact icon="analytics-outline" title="三项指标都有有效样本后显示雷达图" />
        )}
        <View style={styles.indicators}>
          {indicators.map((indicator) => (
            <View
              key={indicator.key}
              style={[styles.indicator, { borderTopColor: colors.borderLight }]}
            >
              <View style={styles.indicatorHeading}>
                <Text style={[styles.indicatorLabel, { color: colors.textSecondary }]}>
                  {indicator.label}
                </Text>
                <Text style={[styles.indicatorValue, { color: colors.text }]}>
                  {indicator.value === null ? '—' : `${formatNumber(indicator.value)}%`}
                </Text>
              </View>
              <Text style={[styles.indicatorFraction, { color: colors.textSecondary }]}>
                {formatCompactNumber(indicator.numerator)} /{' '}
                {formatCompactNumber(indicator.denominator)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.xs, ...Shadow.sm },
  radar: { width: '100%', minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  indicators: { flexDirection: 'row', flexWrap: 'wrap' },
  indicator: {
    width: '50%',
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  indicatorHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs },
  indicatorLabel: { fontSize: FontSize.xs },
  indicatorValue: { fontSize: FontSize.sm, fontWeight: '700' },
  indicatorFraction: { fontSize: FontSize.xs },
});
