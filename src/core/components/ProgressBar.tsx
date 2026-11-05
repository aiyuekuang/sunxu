import { type DimensionValue, StyleSheet, View } from 'react-native';
import { Radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface ProgressBarProps {
  /** 当前值 */
  current: number;
  /** 目标值 */
  target: number;
  /** 高度，默认 6 */
  height?: number;
  /** 完成时的颜色，默认 colors.success */
  completedColor?: string;
  /** 进行中的颜色，默认 colors.primary */
  activeColor?: string;
}

export function ProgressBar({
  current,
  target,
  height = 4,
  completedColor,
  activeColor,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = pct >= 100;
  const fillColor = isComplete
    ? (completedColor ?? colors.success)
    : (activeColor ?? colors.primary);

  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          { width: `${pct}%` as DimensionValue, height, backgroundColor: fillColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
