import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { IconActionButton } from './IconActionButton';

const ACTION_MENU_TARGET = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

export type ActionMenuIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ActionMenuItem {
  id: string;
  label: string;
  onPress: () => void | Promise<void>;
  icon?: ActionMenuIconName;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ActionMenuProps {
  actions: readonly (ActionMenuItem | null | undefined)[];
  title?: string;
  triggerLabel?: string;
  triggerIcon?: ActionMenuIconName;
  maxHeightRatio?: number;
  triggerStyle?: StyleProp<ViewStyle>;
  /** Receives rejected or thrown action errors; errors are logged if omitted. */
  onActionError?: (error: unknown, action: ActionMenuItem) => void | Promise<void>;
  testID?: string;
}

/** More-actions trigger and accessible action list; the host owns every action. */
export function ActionMenu({
  actions,
  title = '更多操作',
  triggerLabel = '更多操作',
  triggerIcon = 'dots-vertical',
  maxHeightRatio = 0.72,
  triggerStyle,
  onActionError,
  testID,
}: ActionMenuProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const items = actions.filter((item): item is ActionMenuItem => Boolean(item));
  const runAction = async (action: ActionMenuItem) => {
    try {
      await action.onPress();
    } catch (error) {
      if (!onActionError) {
        console.error(`ActionMenu action "${action.id}" failed`, error);
        return;
      }
      try {
        await onActionError(error, action);
      } catch (reportError) {
        console.error(`ActionMenu error handler failed for "${action.id}"`, reportError);
      }
    }
  };
  if (!items.length) return null;

  return (
    <>
      <View style={triggerStyle}>
        <IconActionButton
          icon={triggerIcon}
          accessibilityLabel={triggerLabel}
          onPress={() => setVisible(true)}
          testID={testID}
        />
      </View>
      <BottomSheet visible={visible} onClose={() => setVisible(false)} title={title} maxHeightRatio={maxHeightRatio} dynamicHeight>
        <View style={styles.list}>
          {items.map((item, index) => (
            <View key={item.id}>
              {item.destructive && index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ disabled: Boolean(item.disabled) }}
                disabled={item.disabled}
                testID={testID ? `${testID}-action-${item.id}` : undefined}
                onPress={() => {
                  setVisible(false);
                  void runAction(item);
                }}
                style={({ pressed }) => [styles.row, { opacity: item.disabled ? 0.45 : pressed ? 0.72 : 1 }]}
              >
                <MaterialCommunityIcons name={item.icon ?? 'chevron-right'} size={20} color={item.destructive ? colors.error : colors.primary} />
                <AppText style={[styles.label, { color: item.destructive ? colors.error : colors.text }]}>{item.label}</AppText>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  row: { minHeight: ACTION_MENU_TARGET, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.sm },
  label: { flex: 1, fontSize: FontSize.sm, fontWeight: '500' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.xs, marginLeft: Radius.xl },
});
