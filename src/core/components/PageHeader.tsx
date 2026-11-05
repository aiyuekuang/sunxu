import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import {
  type AccessibilityState,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
  /** 不使用 safe area 顶部内边距（嵌套在其他布局中时使用） */
  noSafeArea?: boolean;
  /** 不显示底部分隔线 */
  noBorder?: boolean;
}

export function PageHeader({ title, onBack, right, style, noSafeArea, noBorder }: PageHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: noSafeArea ? Spacing.xs : insets.top + Spacing.xs,
          backgroundColor: colors.surface,
          borderBottomColor: noBorder ? 'transparent' : colors.border,
        },
        style,
      ]}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          hitSlop={HIT_SLOP}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="返回上一页"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

/** 图标按钮，用于 PageHeader 右侧 */
export function HeaderIconButton({
  icon,
  onPress,
  color,
  size = 20,
  accessibilityLabel = '打开操作',
  accessibilityState,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={HIT_SLOP}
      style={styles.iconBtn}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: MIN_TOUCH_TARGET + Spacing.xs,
  },
  backBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  right: {
    minWidth: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  iconBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
