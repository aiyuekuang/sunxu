import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  ControlSize,
  FontSize,
  MIN_TOUCH_TARGET,
  MIN_TOUCH_TARGET_ANDROID,
  Radius,
  Spacing,
} from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';

export type ActionButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type ActionButtonSize = 'sm' | 'md' | 'lg';
type ActionIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ActionButtonProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  icon?: ActionIcon;
  trailingIcon?: ActionIcon;
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
  expanded?: boolean;
  buttonColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/** Theme-aware action button for shared React Native app controls. */
export function ActionButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  selected = false,
  expanded,
  buttonColor,
  textColor,
  style,
  contentStyle,
  labelStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ActionButtonProps) {
  const { colors } = useTheme();
  const unavailable = disabled || loading;
  const minimumTarget = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const compactHitSlop = Math.ceil(Math.max(0, minimumTarget - ControlSize.control) / 2);
  const buttonMinHeight =
    size === 'sm'
      ? ControlSize.control
      : size === 'lg'
        ? Math.max(minimumTarget, ControlSize.actionLarge)
        : minimumTarget;
  const isText = variant === 'text';
  const isOutlined = variant === 'outlined';
  const foreground =
    textColor ??
    (variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.text);
  const background =
    buttonColor ??
    (variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.error
        : variant === 'secondary'
          ? colors.surfaceSecondary
          : 'transparent');
  const borderColor = isOutlined ? buttonColor ?? colors.border : background;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: unavailable, selected, expanded, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      testID={testID}
      hitSlop={size === 'sm' ? compactHitSlop : undefined}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        { minHeight: buttonMinHeight },
        {
          backgroundColor: isText || isOutlined ? 'transparent' : background,
          borderColor: isText ? 'transparent' : borderColor,
          opacity: unavailable ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor ?? (variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary)} />
        ) : icon ? (
          <MaterialCommunityIcons name={icon} size={18} color={foreground} accessible={false} />
        ) : null}
        <AppText style={[styles.label, sizeLabelStyles[size], { color: foreground }, labelStyle]}>
          {children}
        </AppText>
        {trailingIcon ? (
          <MaterialCommunityIcons name={trailingIcon} size={18} color={foreground} accessible={false} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  label: { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
});

const sizeStyles: Record<ActionButtonSize, ViewStyle> = {
  sm: { minHeight: ControlSize.control, paddingVertical: 0 },
  md: { minHeight: MIN_TOUCH_TARGET },
  lg: { minHeight: ControlSize.actionLarge },
};

const sizeLabelStyles: Record<ActionButtonSize, TextStyle> = {
  sm: { fontSize: FontSize.xs },
  md: { fontSize: FontSize.sm },
  lg: { fontSize: FontSize.base },
};
