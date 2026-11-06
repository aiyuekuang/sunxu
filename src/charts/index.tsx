import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
} from 'react-native-gifted-charts';
import type { ComponentProps } from 'react';
import { useTheme } from '../core/theme/useTheme';

type BarChartProps = ComponentProps<typeof BarChart>;
type LineChartProps = ComponentProps<typeof LineChart>;
type PieChartProps = ComponentProps<typeof PieChart>;
type RadarChartProps = ComponentProps<typeof RadarChart>;

/** Theme-adapted native bar chart. All Gifted Charts props remain available. */
export function SunxuBarChart(props: BarChartProps) {
  const { colors } = useTheme();
  return (
    <BarChart
      {...props}
      frontColor={props.frontColor ?? colors.primary}
      rulesColor={props.rulesColor ?? colors.border}
      xAxisColor={props.xAxisColor ?? colors.border}
      yAxisColor={props.yAxisColor ?? colors.border}
      backgroundColor={props.backgroundColor ?? 'transparent'}
      xAxisLabelTextStyle={[{ color: colors.textSecondary }, props.xAxisLabelTextStyle]}
      yAxisTextStyle={[{ color: colors.textSecondary }, props.yAxisTextStyle]}
    />
  );
}

/** Theme-adapted native line chart. All Gifted Charts props remain available. */
export function SunxuLineChart(props: LineChartProps) {
  const { colors } = useTheme();
  return (
    <LineChart
      {...props}
      color={props.color ?? colors.primary}
      dataPointsColor={props.dataPointsColor ?? colors.primary}
      rulesColor={props.rulesColor ?? colors.border}
      xAxisColor={props.xAxisColor ?? colors.border}
      yAxisColor={props.yAxisColor ?? colors.border}
      backgroundColor={props.backgroundColor ?? 'transparent'}
      xAxisLabelTextStyle={[{ color: colors.textSecondary }, props.xAxisLabelTextStyle]}
      yAxisTextStyle={[{ color: colors.textSecondary }, props.yAxisTextStyle]}
    />
  );
}

/** Uses a theme palette for pie slices that do not specify their own color. */
export function SunxuPieChart(props: PieChartProps) {
  const { colors } = useTheme();
  const palette = [colors.primary, colors.success, colors.warning, colors.info, colors.error];
  const data = props.data.map((item, index) => ({
    ...item,
    color: item.color ?? palette[index % palette.length],
  }));
  return (
    <PieChart
      {...props}
      data={data}
      backgroundColor={props.backgroundColor ?? 'transparent'}
      textColor={props.textColor ?? colors.textOnPrimary}
    />
  );
}

/** Theme-adapted native radar chart. All Gifted Charts props remain available. */
export function SunxuRadarChart(props: RadarChartProps) {
  const { colors } = useTheme();
  return (
    <RadarChart
      {...props}
      polygonConfig={{
        stroke: colors.primary,
        fill: colors.primary,
        opacity: 0.18,
        ...props.polygonConfig,
      }}
      gridConfig={{
        stroke: colors.border,
        fill: colors.surface,
        ...props.gridConfig,
      }}
      labelConfig={{ stroke: colors.textSecondary, ...props.labelConfig }}
    />
  );
}

export type { BarChartProps, LineChartProps, PieChartProps, RadarChartProps };
