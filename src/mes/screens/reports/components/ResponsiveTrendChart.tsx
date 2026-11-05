import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatCompactNumber } from '../../../../core/utils/format';

export interface ReportTrendPoint {
  label: string;
  value: number;
  axisLabel?: string;
}

interface ResponsiveTrendChartProps {
  points: ReportTrendPoint[];
  accessibilityLabel: string;
  mode?: 'area' | 'hourly';
}

const CHART_HEIGHT = 196;
const LEFT_GUTTER = 42;
const RIGHT_GUTTER = 10;
const TOP_GUTTER = 12;
const BOTTOM_GUTTER = 28;

function niceMaximum(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return step * magnitude;
}

export function ResponsiveTrendChart({
  points,
  accessibilityLabel,
  mode = 'area',
}: ResponsiveTrendChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const chart = useMemo(() => {
    const values = points.map((point) => Number(point.value ?? 0));
    const cumulative = values.reduce<number[]>((result, value) => {
      result.push((result[result.length - 1] ?? 0) + value);
      return result;
    }, []);
    const scaleValues = mode === 'hourly' ? [...values, ...cumulative] : values;
    const maxValue = niceMaximum(Math.max(0, ...scaleValues));
    const minValue =
      Math.min(0, ...scaleValues) < 0 ? -niceMaximum(Math.abs(Math.min(0, ...scaleValues))) : 0;
    const plotWidth = Math.max(width - LEFT_GUTTER - RIGHT_GUTTER, 0);
    const plotHeight = CHART_HEIGHT - TOP_GUTTER - BOTTOM_GUTTER;
    const slotWidth = points.length > 0 ? plotWidth / points.length : plotWidth;
    const scaleRange = maxValue - minValue || 1;
    const yFor = (value: number) => TOP_GUTTER + ((maxValue - value) / scaleRange) * plotHeight;
    const xFor = (index: number) => LEFT_GUTTER + slotWidth * (index + 0.5);
    const linePath = (series: number[]) =>
      series
        .map((value, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(value)}`)
        .join(' ');
    const areaPath = values.length
      ? `${linePath(values)} L ${xFor(values.length - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`
      : '';
    const labelStep = points.length <= 8 ? 1 : points.length <= 16 ? 2 : 4;
    const ticks = [minValue, (minValue + maxValue) / 2, maxValue];
    return {
      areaPath,
      cumulative,
      labelStep,
      linePath: linePath(mode === 'hourly' ? cumulative : values),
      maxValue,
      minValue,
      plotHeight,
      plotWidth,
      slotWidth,
      ticks,
      values,
      xFor,
      yFor,
    };
  }, [mode, points, width]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {width > 0 && points.length > 0 ? (
        <Svg
          width={width}
          height={CHART_HEIGHT}
          accessibilityRole="image"
          accessibilityLabel={accessibilityLabel}
        >
          {chart.ticks.map((tick) => {
            const y = chart.yFor(tick);
            return (
              <G key={`tick-${tick}`}>
                <Line
                  x1={LEFT_GUTTER}
                  x2={width - RIGHT_GUTTER}
                  y1={y}
                  y2={y}
                  stroke={colors.borderLight}
                  strokeWidth={1}
                />
                <SvgText
                  x={LEFT_GUTTER - Spacing.xs}
                  y={y + 4}
                  fill={colors.textSecondary}
                  fontSize={FontSize.xs - 1}
                  textAnchor="end"
                >
                  {formatCompactNumber(tick)}
                </SvgText>
              </G>
            );
          })}
          {mode === 'hourly' ? (
            chart.values.map((value, index) => {
              const baseline = chart.yFor(0);
              const y = chart.yFor(value);
              const barWidth = Math.min(16, chart.slotWidth * 0.58);
              return (
                <Rect
                  key={`bar-${points[index]?.label ?? index}`}
                  x={chart.xFor(index) - barWidth / 2}
                  y={Math.min(y, baseline)}
                  width={barWidth}
                  height={Math.max(Math.abs(baseline - y), 1)}
                  rx={2}
                  fill={colors.primary}
                />
              );
            })
          ) : (
            <>
              <Path d={chart.areaPath} fill={colors.primarySurface} opacity={0.42} />
              <Path
                d={chart.linePath}
                fill="none"
                stroke={colors.primary}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {chart.values.map((value, index) =>
                index === 0 ||
                index === chart.values.length - 1 ||
                index % chart.labelStep === 0 ? (
                  <Circle
                    key={`point-${points[index]?.label ?? index}`}
                    cx={chart.xFor(index)}
                    cy={chart.yFor(value)}
                    r={3}
                    fill={colors.primary}
                  />
                ) : null,
              )}
            </>
          )}
          {mode === 'hourly' ? (
            <Path
              d={chart.linePath}
              fill="none"
              stroke={colors.success}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {points.map((point, index) => {
            const showLabel =
              index === 0 || index === points.length - 1 || index % chart.labelStep === 0;
            if (!showLabel || !point.axisLabel) return null;
            return (
              <SvgText
                key={`label-${point.label}`}
                x={chart.xFor(index)}
                y={CHART_HEIGHT - 7}
                fill={colors.textSecondary}
                fontSize={FontSize.xs - 1}
                textAnchor="middle"
              >
                {point.axisLabel}
              </SvgText>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', minHeight: CHART_HEIGHT },
});
