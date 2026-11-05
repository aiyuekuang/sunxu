import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

type AppToastVariant = 'success' | 'error' | 'info';
const MAX_MESSAGE_LINES = 6;
const TOAST_MAX_WIDTH = 560;
const TOAST_HORIZONTAL_GUTTER = Spacing.base * 2;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppToastProps {
  /** 标题文案，默认对应 toast 类型标题 */
  title?: string;
  /** 详细提示内容，支持多行自适应 */
  message?: string;
  /** 语义类型，决定左侧强调色 */
  variant?: AppToastVariant;
  /** 点击回调，传入时提供轻微点击反馈 */
  onPress?: () => void;
  /** 布局自定义 */
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppToast({ title, message, variant = 'info', onPress, style }: AppToastProps) {
  const { colors } = useTheme();
  const frame = useSafeAreaFrame();

  const accentColor =
    variant === 'success' ? colors.success : variant === 'error' ? colors.error : colors.info;
  const safeFrameWidth = Math.max(frame.width, TOAST_HORIZONTAL_GUTTER);
  const containerWidth = Math.min(safeFrameWidth - TOAST_HORIZONTAL_GUTTER, TOAST_MAX_WIDTH);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.92 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.container,
        Shadow.md,
        {
          width: containerWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: accentColor,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {!!title && (
          <Text
            numberOfLines={message ? 1 : 2}
            ellipsizeMode="tail"
            style={[styles.title, { color: colors.text }, message ? styles.titleWithMessage : null]}
          >
            {title}
          </Text>
        )}
        {!!message && (
          <Text
            numberOfLines={MAX_MESSAGE_LINES}
            ellipsizeMode="tail"
            style={[styles.message, { color: colors.textSecondary }]}
          >
            {message}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderLeftWidth: 5,
    minHeight: 72,
  },
  content: {
    flexShrink: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  titleWithMessage: {
    marginBottom: Spacing.xs,
  },
  message: {
    flexShrink: 1,
    fontSize: FontSize.sm,
  },
});
