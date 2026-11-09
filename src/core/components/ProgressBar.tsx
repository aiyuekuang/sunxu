import { type DimensionValue, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
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
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  current,
  target,
  height = 4,
  completedColor,
  activeColor,
  style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = pct >= 100;
  const fillColor = isComplete
    ? (completedColor ?? colors.success)
    : (activeColor ?? colors.primary);

  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }, style]}>
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
