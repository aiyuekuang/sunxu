import { Pressable, StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';

export interface ReportDonutItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface ReportDonutChartProps {
  items: ReportDonutItem[];
  centerLabel: string;
  centerValue: number | string;
  accessibilityLabel: string;
  onPressItem?: (id: string) => void;
}

export function ReportDonutChart({
  items,
  centerLabel,
  centerValue,
  accessibilityLabel,
  onPressItem,
}: ReportDonutChartProps) {
  const { colors } = useTheme();
  const positiveItems = items.filter((item) => Number(item.value) > 0);
  const total = positiveItems.reduce((sum, item) => sum + Number(item.value), 0);
  const chartData = positiveItems.map((item) => ({
    value: Number(item.value),
    color: item.color,
    tooltipText: `${item.label} ${formatCompactNumber(item.value)}`,
  }));

  return (
    <View style={styles.container}>
      {chartData.length > 0 ? (
        <View
          style={styles.chart}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
        >
          <PieChart
            data={chartData}
            donut
            radius={58}
            innerRadius={40}
            innerCircleColor={colors.surface}
            showTooltip
            tooltipBackgroundColor={colors.text}
            tooltipTextNoOfLines={2}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={[styles.centerValue, { color: colors.text }]} numberOfLines={1}>
                  {typeof centerValue === 'number' ? formatCompactNumber(centerValue) : centerValue}
                </Text>
                <Text
                  style={[styles.centerCaption, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {centerLabel}
                </Text>
              </View>
            )}
          />
        </View>
      ) : null}
      {positiveItems.length > 0 ? (
        <View style={styles.legend}>
          {positiveItems.map((item) => {
            const share = total > 0 ? (Number(item.value) / total) * 100 : 0;
            const content = (
              <>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text
                  style={[styles.legendLabel, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text style={[styles.legendValue, { color: colors.text }]} numberOfLines={1}>
                  {formatCompactNumber(item.value)} · {formatCompactNumber(share)}%
                </Text>
              </>
            );
            return onPressItem ? (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.legendItem, pressed && styles.pressed]}
                onPress={() => onPressItem(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} ${formatCompactNumber(item.value)}，${formatCompactNumber(share)}%`}
              >
                {content}
              </Pressable>
            ) : (
              <View key={item.id} style={styles.legendItem}>
                {content}
              </View>
            );
          })}
        </View>
      ) : null}
      {positiveItems.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>暂无可展示数据</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm },
  chart: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { alignItems: 'center', maxWidth: 74 },
  centerValue: { fontSize: FontSize.base, fontWeight: '700' },
  centerCaption: { fontSize: FontSize.xs },
  legend: { width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  legendItem: {
    width: '50%',
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  legendDot: { width: 8, height: 8, borderRadius: Radius.full },
  legendLabel: { flex: 1, fontSize: FontSize.xs },
  legendValue: { fontSize: FontSize.xs, fontWeight: '700' },
  empty: { minHeight: MIN_TOUCH_TARGET, textAlignVertical: 'center', fontSize: FontSize.sm },
  pressed: { opacity: 0.72 },
});
