import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountBadge } from './Badge';
import { AppText as Text } from './AppText';
import {
  FontSize,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Spacing,
} from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';

const TAB_TARGET = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

/** A tab item for the bottom navigation bar. Route changes stay with the host. */
export interface BottomTabItem<T extends string = string> {
  key: T;
  label: string;
  icon: ReactNode;
  /** Optional icon rendered while this tab is selected. */
  activeIcon?: ReactNode;
  /** Highlight a high-priority tab with the library's primary icon surface. */
  emphasis?: 'primary';
  /** Optional surface color for an emphasized tab; defaults to the theme primary color. */
  emphasisColor?: string;
  /** Hide the visual label while keeping `label` as the default accessible name. */
  labelVisible?: boolean;
  /** Positive numbers and non-empty strings render a badge; numeric values above 99 show as 99+. */
  badge?: number | string;
  /** Optional independent action for an actionable badge, such as opening unread items. */
  onBadgePress?: () => void;
  badgeAccessibilityLabel?: string;
  badgeAccessibilityHint?: string;
  badgeTestID?: string;
  /** Optional replacement for the default label (which includes the visible badge value). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  disabled?: boolean;
}

export interface BottomTabBarProps<T extends string = string> {
  tabs: readonly BottomTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderTopColor?: string;
  /** Height of the visible bar content, excluding the bottom safe-area inset. */
  baseHeight?: number;
  /** Minimum space below the bar when the host has no bottom safe-area inset. */
  bottomInsetBase?: number;
  /** Set false when the host already owns the bottom safe-area padding. */
  includeSafeArea?: boolean;
}

/**
 * Controlled bottom navigation presentation. The host owns routes, permissions,
 * menu configuration, badges' data, and the selected key.
 */
export function BottomTabBar<T extends string = string>({
  tabs,
  activeKey,
  onChange,
  accessibilityLabel = '主导航',
  style,
  backgroundColor,
  borderTopColor,
  baseHeight,
  bottomInsetBase = Spacing.sm,
  includeSafeArea = true,
}: BottomTabBarProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const labelFontSize = useScaledFontSize(FontSize.xs);
  const paddingBottom = includeSafeArea
    ? Math.max(insets.bottom, bottomInsetBase)
    : bottomInsetBase;

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor ?? colors.tabBarBg,
          borderTopColor: borderTopColor ?? colors.tabBarBorder,
          paddingBottom,
          height: baseHeight === undefined ? undefined : baseHeight + paddingBottom,
        },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const selected = tab.key === activeKey;
        const badge = visibleBadge(tab.badge);
        const labelColor = tab.disabled
          ? colors.textMuted
          : selected
            ? colors.tabBarActive
            : colors.tabBarInactive;

        return (
          <View key={tab.key} style={styles.itemContainer}>
            <Pressable
              testID={tab.testID}
              disabled={tab.disabled}
              onPress={() => onChange(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.accessibilityLabel ?? accessibleTabLabel(tab.label, badge)}
              accessibilityHint={tab.accessibilityHint}
              accessibilityState={{ selected, disabled: tab.disabled }}
              aria-selected={selected}
              style={({ pressed }) => [
                styles.item,
                pressed && !tab.disabled ? styles.itemPressed : null,
                tab.disabled ? styles.itemDisabled : null,
              ]}
            >
              <View style={styles.itemContent}>
                <View
                  style={[
                    styles.iconSlot,
                    tab.emphasis === 'primary' && styles.primaryIconSlot,
                    tab.emphasis === 'primary' && {
                      backgroundColor: tab.emphasisColor ?? colors.primary,
                    },
                  ]}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  {selected ? tab.activeIcon ?? tab.icon : tab.icon}
                </View>
                {tab.labelVisible === false ? null : (
                  <Text
                    numberOfLines={1}
                    style={[styles.label, { color: labelColor, fontSize: labelFontSize }]}
                  >
                    {tab.label}
                  </Text>
                )}
              </View>
            </Pressable>
            {badge ? (
              tab.onBadgePress ? (
                <Pressable
                  onPress={tab.onBadgePress}
                  accessibilityRole="button"
                  accessibilityLabel={tab.badgeAccessibilityLabel ?? `查看${tab.label}，${badge}`}
                  accessibilityHint={tab.badgeAccessibilityHint}
                  accessibilityState={{ disabled: tab.disabled }}
                  disabled={tab.disabled}
                  testID={tab.badgeTestID}
                  style={styles.badgeAction}
                >
                  <CountBadge count={badge} tone="error" />
                </Pressable>
              ) : (
                <View pointerEvents="none" style={styles.badgeAction}>
                  <CountBadge count={badge} tone="error" />
                </View>
              )
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function visibleBadge(value: number | string | undefined): string | undefined {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return undefined;
    return value > 99 ? '99+' : String(value);
  }
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function accessibleTabLabel(label: string, badge?: string): string {
  return badge ? `${label}，${badge}` : label;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  itemContainer: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  item: {
    flex: 1,
    minWidth: 0,
    minHeight: TAB_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIconSlot: {
    width: TAB_TARGET,
    height: TAB_TARGET,
    borderRadius: 22,
  },
  badgeAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    maxWidth: '100%',
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  itemPressed: {
    opacity: 0.72,
  },
  itemDisabled: {
    opacity: 0.72,
  },
});
