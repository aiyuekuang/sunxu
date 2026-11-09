import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import { useTheme } from '../theme/useTheme';
import { FontSize, Spacing, Radius } from '../theme/tokens';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /** 自定义颜色，优先于 variant。传 color 会自动生成 20% 透明度背景 */
  color?: string;
  /** 自定义背景色，配合 color 使用 */
  bg?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'default', color, bg, size = 'md', style }: BadgeProps) {
  const { colors } = useTheme();

  const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successSurface, text: colors.success },
    warning: { bg: colors.warningSurface, text: colors.warning },
    error: { bg: colors.errorSurface, text: colors.error },
    info: { bg: colors.infoSurface, text: colors.info },
    primary: { bg: colors.primarySurface, text: colors.primary },
    default: { bg: colors.borderLight, text: colors.textSecondary },
  };

  // 自定义颜色优先
  const finalBg = bg ?? (color ? `${color}20` : variantMap[variant].bg);
  const finalText = color ?? variantMap[variant].text;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: finalBg }, isSmall && styles.badgeSm, style]}>
      <Text style={[styles.label, { color: finalText }, isSmall && styles.labelSm]}>{label}</Text>
    </View>
  );
}

/** 状态配置映射表类型，各屏幕定义状态配色时使用 */
export type StatusConfig<T extends string = string> = Record<
  T,
  { label: string; color: string; bg?: string }
>;

/** 根据 StatusConfig 渲染 Badge 的便捷组件 */
export function ConfigBadge<T extends string>({
  value,
  config,
  size = 'md',
  fallbackLabel,
}: {
  value: T;
  config: StatusConfig<T>;
  size?: 'sm' | 'md';
  fallbackLabel?: string;
}) {
  // 兜底显性化：未命中且 value 非空时显示原始码（可排查），value 为空才显示「未知状态」
  const cfg = config[value] ?? {
    label: value ? (fallbackLabel ?? String(value)) : (fallbackLabel ?? '未知状态'),
    color: '#999999',
  };
  return <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size={size} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: FontSize.xs,
  },
});
