import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function LoadingView() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

interface InlineLoadingProps {
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
  },
});
