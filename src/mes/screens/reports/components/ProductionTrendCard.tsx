import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CompletedWorkOrderTrendItemDto } from '../../../types/models/CompletedWorkOrderTrendItemDto';
import type { ProductionTrendItemDto } from '../../../types/models/ProductionTrendItemDto';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { StatusTabs, type TabItem } from '../../../../core/components/StatusTabs.tsx';
import type { ReportPeriodState } from '../../../constants/report-quick-range';
import { Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { parseDate } from '../../../../core/utils/date';
import { ReportSectionHeader } from './ReportSectionHeader.tsx';
import { ResponsiveTrendChart } from './ResponsiveTrendChart.tsx';

type TrendMode = 'output' | 'completed';

interface ProductionTrendCardProps {
  outputTrend: ProductionTrendItemDto[];
  completedTrend: CompletedWorkOrderTrendItemDto[];
  period: ReportPeriodState;
}

function shortTrendLabel(value: string): string {
  if (/^\d{4}-\d{2}$/.test(value)) return `${Number(value.slice(5))}月`;
  const parsed = parseDate(value);
  if (parsed) return parsed.format('M/D');
  return value.length > 8 ? value.slice(-8) : value;
}

function trendPointLabel(
  label: string,
  index: number,
  total: number,
  period: ReportPeriodState,
): string {
  if (total <= 7 || period.key === 'year') return shortTrendLabel(label);
  if (index === 0 || index === total - 1) return shortTrendLabel(label);
  if (period.key === 'today') return index % 4 === 0 ? shortTrendLabel(label) : '';
  return index % 7 === 0 ? shortTrendLabel(label) : '';
}

const TREND_MODE_TABS: TabItem<TrendMode>[] = [
  { key: 'output', label: '完工产量' },
  { key: 'completed', label: '完工工单' },
];

function TrendModeSwitch({
  value,
  onChange,
}: {
  value: TrendMode;
  onChange: (value: TrendMode) => void;
}) {
  return (
    <StatusTabs
      tabs={TREND_MODE_TABS}
      activeKey={value}
      onChange={onChange}
      density="compact"
      // 嵌在区块标题行的自适应宽度槽位，必须按内容收缩；默认 stretch 会撑满整行并把标题挤没
      sizing="hug"
    />
  );
}

export function ProductionTrendCard({
  outputTrend,
  completedTrend,
  period,
}: ProductionTrendCardProps) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<TrendMode>('output');
  const points =
    mode === 'output'
      ? outputTrend.map((item, index) => ({
          label: item.label,
          value: Number(item.qty ?? 0),
          axisLabel: trendPointLabel(item.label, index, outputTrend.length, period),
        }))
      : completedTrend.map((item, index) => ({
          label: item.label,
          value: Number(item.count ?? 0),
          axisLabel: trendPointLabel(item.label, index, completedTrend.length, period),
        }));
  const hasData = points.some((point) => point.value !== 0);

  return (
    <>
      <ReportSectionHeader
        title="产出趋势"
        hint="按实际完工时间归属所选期间"
        action={<TrendModeSwitch value={mode} onChange={setMode} />}
      />
      <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        {hasData ? (
          <ResponsiveTrendChart
            points={points}
            accessibilityLabel={`${mode === 'output' ? '完工产量' : '完工工单'}趋势图`}
          />
        ) : (
          <EmptyState
            compact
            icon="analytics-outline"
            title={mode === 'output' ? '当前范围暂无完工产量' : '当前范围暂无完工工单'}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    minHeight: 208,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.sm,
  },
});
