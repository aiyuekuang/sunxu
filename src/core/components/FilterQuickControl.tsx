import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from './AppText.tsx';
import { FontSize, MIN_TOUCH_TARGET, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

const COMPACT_CONTROL_HIT_SLOP = { top: 4, right: 0, bottom: 4, left: 0 } as const;

export interface FilterQuickControlProps {
  label: string;
  active?: boolean;
  expanded?: boolean;
  badgeCount?: number;
  onPress: () => void;
  accessibilityLabel?: string;
}

/** 快捷筛选行的统一无底色控件，统一视觉高度并通过 hitSlop 保留触控尺寸。 */
export function FilterQuickControl({
  label,
  active = false,
  expanded,
  badgeCount = 0,
  onPress,
  accessibilityLabel,
}: FilterQuickControlProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.control}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={COMPACT_CONTROL_HIT_SLOP}
      accessibilityRole="button"
      accessibilityState={{ expanded, selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
      aria-expanded={expanded}
    >
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
      <View style={styles.trailing}>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={active ? colors.primary : colors.textSecondary}
        />
        {badgeCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.textOnPrimary }]}>{badgeCount}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET - Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    flexShrink: 1,
  },
  trailing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -9,
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
