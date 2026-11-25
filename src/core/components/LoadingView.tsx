import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';

export interface LoadingViewProps {
  /** 可见的加载说明；省略时仅显示加载指示器。 */
  message?: string;
}

export function LoadingView({ message }: LoadingViewProps = {}) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? '正在加载'}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
}

export interface InlineLoadingProps {
  /** 覆盖默认颜色（主题色），常用于按钮内白色 spinner */
  color?: string;
  /** 传递给 React Native ActivityIndicator 的尺寸；小尺寸可以传具体数字 */
  size?: 'small' | 'large' | number;
  /** 外层容器样式，用于位置微调 */
  style?: ViewStyle;
}

export function InlineLoading({ color, size = 'small', style }: InlineLoadingProps = {}) {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={color ?? colors.primary} style={style} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
