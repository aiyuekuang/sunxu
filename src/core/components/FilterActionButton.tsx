import { Ionicons } from '@expo/vector-icons';
import { type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

const COMPACT_CONTROL_HIT_SLOP = { top: 4, right: 0, bottom: 4, left: 0 } as const;

export interface FilterActionButtonProps {
  label?: string;
  count?: number;
  expanded?: boolean;
  /** 仅显示筛选图标；保留可访问名称和筛选数量提示。 */
  iconOnly?: boolean;
  /** 密集筛选条使用紧凑视觉高度，触控扩展由 hitSlop 保留。 */
  size?: 'default' | 'compact';
  /** 视觉层级；plain 用于密集工具栏中的无背景入口，默认保留 surface 样式。 */
  appearance?: 'surface' | 'plain';
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** 统一的高级筛选入口，供 FilterBar 和业务筛选条共用。 */
export function FilterActionButton({
  label = '筛选',
  count = 0,
  expanded,
  iconOnly = false,
  size = 'default',
  appearance = 'surface',
  onPress,
  accessibilityLabel,
  style,
}: FilterActionButtonProps) {
  const { colors } = useTheme();
  const active = count > 0;
  const emphasized = iconOnly && (active || expanded);
  const isPlain = appearance === 'plain';
  const iconColor = active || expanded ? colors.primary : colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        iconOnly && styles.iconOnlyButton,
        iconOnly && size === 'compact' && styles.compactIconOnlyButton,
        {
          backgroundColor: isPlain
            ? 'transparent'
            : emphasized
              ? colors.primarySurface
              : colors.surfaceSecondary,
          borderColor: isPlain ? 'transparent' : emphasized ? colors.primary : colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={COMPACT_CONTROL_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ expanded, selected: active }}
      aria-expanded={expanded}
    >
      {!iconOnly ? (
        <Text
          style={[
            styles.label,
            {
              color: active ? colors.primary : colors.text,
              fontWeight: active ? '600' : '500',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
      <View style={[styles.iconWrap, iconOnly && styles.iconOnlyIconWrap]}>
        <Ionicons
          name={expanded ? 'options' : 'options-outline'}
          size={iconOnly ? 20 : 14}
          color={iconOnly ? iconColor : active ? colors.primary : colors.textSecondary}
        />
        {active ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.textOnPrimary }]}>{count}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 36,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  iconOnlyButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  compactIconOnlyButton: {
    minWidth: MIN_TOUCH_TARGET - Spacing.sm,
    minHeight: MIN_TOUCH_TARGET - Spacing.sm,
  },
  label: {
    fontSize: FontSize.xs,
  },
  iconWrap: {
    position: 'relative',
  },
  iconOnlyIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
