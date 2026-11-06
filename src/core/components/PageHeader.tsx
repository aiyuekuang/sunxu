import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  type AccessibilityState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText';
import {
  FontSize,
  HIT_SLOP,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Radius,
  Shadow,
  Spacing,
} from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface HeaderAction {
  /** Stable identifier used as the action key and test ID. */
  id: string;
  /** Visible label in the overflow menu and accessible name for an icon-only action. */
  label: string;
  onPress: () => void;
  /** Used for the single visible action; overflow rows use text labels. */
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
  disabled?: boolean;
  destructive?: boolean;
}

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  /** Existing custom content slot. Use `actions` for count-aware header actions. */
  right?: React.ReactNode;
  /** One action stays visible; multiple actions are disclosed from an ellipsis menu. */
  actions?: readonly HeaderAction[];
  style?: ViewStyle;
  /** 不使用 safe area 顶部内边距（嵌套在其他布局中时使用） */
  noSafeArea?: boolean;
  /** 不显示底部分隔线 */
  noBorder?: boolean;
}

export function PageHeader({
  title,
  onBack,
  right,
  actions,
  style,
  noSafeArea,
  noBorder,
}: PageHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 0, right: Spacing.sm });
  const menuTriggerRef = useRef<View>(null);
  const touchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const actionCount = actions?.length ?? 0;
  const rightColumnWidth = actions !== undefined && actionCount > 0 ? touchTarget : undefined;

  useEffect(() => {
    if (actionCount < 2) setMenuVisible(false);
  }, [actionCount]);

  const closeMenu = () => setMenuVisible(false);
  const openMenu = () => {
    menuTriggerRef.current?.measureInWindow((x, y, width, height) => {
      const top = y + height + Spacing.xs;
      setMenuPosition({
        top,
        right: Math.max(Spacing.sm, windowWidth - x - width),
      });
      setMenuVisible(true);
    });
  };

  let rightContent = right ?? null;
  if (actions !== undefined) {
    if (actionCount === 0) {
      rightContent = right ?? null;
    } else if (actionCount === 1) {
      const action = actions[0];
      rightContent = (
        <HeaderIconButton
          icon={action.icon}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel ?? action.label}
          disabled={action.disabled}
          color={action.destructive ? colors.error : undefined}
          testID={`page-header-action-${action.id}`}
        />
      );
    } else if (actionCount > 1) {
      rightContent = (
        <Pressable
          ref={menuTriggerRef}
          onPress={openMenu}
          hitSlop={HIT_SLOP}
          style={({ pressed }) => [styles.iconBtn, { width: touchTarget, height: touchTarget, opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="更多操作"
          accessibilityState={{ expanded: menuVisible }}
          testID="page-header-more-actions"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </Pressable>
      );
    } else {
      rightContent = null;
    }
  }

  return (
    <>
      <View
        style={[
          styles.header,
          {
            paddingTop: noSafeArea ? Spacing.xs : insets.top + Spacing.xs,
            backgroundColor: colors.surface,
            borderBottomColor: noBorder ? 'transparent' : colors.border,
            minHeight: touchTarget + Spacing.xs,
          },
          style,
        ]}
      >
        <View style={[styles.left, { width: touchTarget }]}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={HIT_SLOP}
              style={[styles.backBtn, { width: touchTarget, height: touchTarget }]}
              accessibilityRole="button"
              accessibilityLabel="返回上一页"
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={[styles.right, { width: rightColumnWidth, minWidth: touchTarget }]}>{rightContent}</View>
      </View>

      {actions && actionCount > 1 ? (
        <Modal
          visible={menuVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          presentationStyle="overFullScreen"
          onRequestClose={closeMenu}
        >
          <View style={styles.menuOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeMenu}
              accessibilityRole="button"
              accessibilityLabel="关闭操作菜单"
            />
            <View
              style={[
                styles.menu,
                {
                  top: menuPosition.top,
                  right: menuPosition.right,
                  width: Math.min(256, Math.max(160, windowWidth - Spacing.md * 2)),
                  maxHeight: Math.max(0, windowHeight - menuPosition.top - Spacing.sm),
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
              accessibilityRole="menu"
              accessibilityLabel="页头操作"
              accessibilityViewIsModal
              onAccessibilityEscape={closeMenu}
              testID="page-header-action-menu"
            >
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {actions.map((action) => (
                  <Pressable
                    key={action.id}
                    onPress={() => {
                      closeMenu();
                      action.onPress();
                    }}
                    disabled={action.disabled}
                    style={({ pressed }) => [
                      styles.menuAction,
                      { minHeight: touchTarget },
                      pressed && !action.disabled ? { backgroundColor: colors.surfaceSecondary } : null,
                      action.disabled ? styles.disabledAction : null,
                    ]}
                    accessibilityRole="menuitem"
                    accessibilityLabel={action.accessibilityLabel ?? action.label}
                    accessibilityState={{ disabled: action.disabled }}
                    testID={`page-header-action-${action.id}`}
                  >
                    <Text
                      style={{
                        color: action.disabled ? colors.textMuted : action.destructive ? colors.error : colors.text,
                      }}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
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
  disabled = false,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  disabled?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  const touchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      style={[styles.iconBtn, { width: touchTarget, height: touchTarget }]}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ ...accessibilityState, disabled }}
      testID={testID}
    >
      <Ionicons name={icon} size={size} color={disabled ? colors.textMuted : color ?? colors.text} />
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
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    ...Shadow.md,
    elevation: 8,
  },
  menuAction: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
  },
  disabledAction: {
    opacity: 0.65,
  },
});
