import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { DetailCard } from './DetailCard';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
  value?: string | number;
}

export function ChartLegend({
  items,
  direction = 'row',
}: {
  items: ChartLegendItem[];
  direction?: 'row' | 'column';
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.legend, direction === 'column' ? styles.legendColumn : null]}>
      {items.map((item) => (
        <View key={item.id} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: item.color }]} />
          <AppText style={[styles.legendLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.label}
          </AppText>
          {item.value !== undefined ? (
            <AppText style={[styles.legendValue, { color: colors.text }]}>{item.value}</AppText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export type ChartPanelState = 'ready' | 'loading' | 'empty' | 'error';

export interface ChartPanelProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  legend?: React.ReactNode;
  state?: ChartPanelState;
  stateMessage?: string;
  onRetry?: () => void;
  chartStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  testID?: string;
}

/** Standard chart section and loading/empty/error states. The renderer stays injectable. */
export function ChartPanel({
  title,
  subtitle,
  right,
  children,
  legend,
  state = 'ready',
  stateMessage,
  onRetry,
  chartStyle,
  containerStyle,
  testID,
}: ChartPanelProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID}>
      <DetailCard title={title} right={right} containerStyle={containerStyle}>
        {subtitle ? <AppText style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</AppText> : null}
        {state === 'ready' ? (
          <>
            <View style={[styles.chart, chartStyle]}>{children}</View>
            {legend}
          </>
        ) : (
          <View style={[styles.state, chartStyle]} accessibilityLiveRegion="polite">
            {state === 'loading' ? (
              <>
                <ActivityIndicator color={colors.primary} />
                <AppText style={[styles.stateText, { color: colors.textSecondary }]}>
                  {stateMessage ?? '正在加载图表'}
                </AppText>
              </>
            ) : (
              <>
                <Ionicons
                  name={state === 'empty' ? 'bar-chart-outline' : 'alert-circle-outline'}
                  size={28}
                  color={state === 'error' ? colors.error : colors.textTertiary}
                />
                <AppText style={[styles.stateText, { color: colors.textSecondary }]}>
                  {stateMessage ?? (state === 'empty' ? '暂无可展示的数据' : '图表加载失败')}
                </AppText>
                {state === 'error' && onRetry ? (
                  <Pressable
                    onPress={onRetry}
                    style={[styles.retry, { borderColor: colors.border }]}
                    accessibilityRole="button"
                    accessibilityLabel="重新加载图表"
                  >
                    <AppText style={{ color: colors.primary }}>重试</AppText>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        )}
      </DetailCard>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: FontSize.xs, marginBottom: Spacing.sm },
  chart: { minHeight: 180, justifyContent: 'center' },
  state: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  stateText: { fontSize: FontSize.sm, textAlign: 'center' },
  retry: {
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET * 1.5,
    paddingHorizontal: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  legendColumn: { flexDirection: 'column', alignItems: 'flex-start' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: MIN_TOUCH_TARGET / 2 },
  swatch: { width: 9, height: 9, borderRadius: 3 },
  legendLabel: { fontSize: FontSize.xs, flexShrink: 1 },
  legendValue: { fontSize: FontSize.xs, fontWeight: '600' },
});
