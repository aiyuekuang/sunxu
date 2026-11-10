import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type GestureResponderEvent,
} from 'react-native';
import { HIT_SLOP, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export type IconActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type IconActionVariant = 'plain' | 'tinted' | 'filled';
type ActionIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface IconActionButtonProps {
  icon: ActionIcon;
  onPress: (event: GestureResponderEvent) => void;
  accessibilityLabel: string;
  tone?: IconActionTone;
  variant?: IconActionVariant;
  /** Layout box size in dp; hitSlop expands the target to the platform minimum. */
  size?: number;
  iconSize?: number;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Icon-only action with a transparent visual surface by default and an accessible target. */
export function IconActionButton({
  icon,
  onPress,
  accessibilityLabel,
  tone = 'neutral',
  variant = 'plain',
  size = MIN_TOUCH_TARGET,
  iconSize = 20,
  disabled = false,
  selected = false,
  style,
  testID,
}: IconActionButtonProps) {
  const { colors } = useTheme();
  const minimumTouchTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const hitSlop = Math.max(HIT_SLOP.top, (minimumTouchTarget - size) / 2);
  const color =
    tone === 'primary'
      ? colors.primary
      : tone === 'success'
        ? colors.success
        : tone === 'warning'
          ? colors.warning
          : tone === 'danger'
            ? colors.error
            : colors.textSecondary;
  const fill =
    variant === 'filled'
      ? color
      : variant === 'tinted'
        ? `${color}18`
        : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: fill, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={variant === 'filled' ? '#FFFFFF' : color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
