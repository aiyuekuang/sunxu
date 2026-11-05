import { StyleSheet, View } from 'react-native';
import type { ReportDetailSummary } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatAmount, formatNumber } from '../../../../core/utils/format';
import { ReportMetricCard } from './ReportMetricCard.tsx';

interface ReportSummaryCardProps {
  summary: ReportDetailSummary | null;
  priceVisible: boolean;
}

export function ReportSummaryCard({ summary, priceVisible }: ReportSummaryCardProps) {
  const { colors } = useTheme();
  const { mask } = useAmountDisplay({ permitted: priceVisible });

  if (!summary) return null;

  const summaryItems = [
    ...summary.metrics.map((metric) => ({
      key: metric.label,
      label: metric.label,
      value:
        metric.value === null
          ? '—'
          : metric.unit === '元'
            ? mask(formatAmount(metric.value))
            : `${formatNumber(metric.value)}${metric.unit ?? ''}`,
    })),
    ...summary.customFieldSummaries.map((field) => ({
      key: field.fieldKey,
      label: field.label,
      value: field.value === null ? '—' : formatNumber(field.value),
    })),
  ];

  return (
    <ListCard style={styles.card}>
      <ListCard.Header>
        <ListCard.Title>筛选范围汇总</ListCard.Title>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>不只当前页</Text>
      </ListCard.Header>
      <View style={styles.metricsGrid}>
        {summaryItems.map((item) => (
          <ReportMetricCard
            key={item.key}
            variant="summary"
            label={item.label}
            value={item.value}
          />
        ))}
      </View>
    </ListCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: Spacing.sm },
  hint: { fontSize: FontSize.xs },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
