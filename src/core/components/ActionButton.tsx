import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../theme/tokens';
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
  loading?: boolean;
  disabled?: boolean;
  selected?: boolean;
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
  loading = false,
  disabled = false,
  selected = false,
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
      accessibilityState={{ disabled: unavailable, selected, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      testID={testID}
      hitSlop={size === 'sm' ? 4 : undefined}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
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
          <MaterialCommunityIcons name={icon} size={18} color={foreground} />
        ) : null}
        <AppText style={[styles.label, sizeLabelStyles[size], { color: foreground }, labelStyle]}>
          {children}
        </AppText>
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
  sm: { minHeight: 36, paddingVertical: 0 },
  md: { minHeight: MIN_TOUCH_TARGET },
  lg: { minHeight: 52 },
};

const sizeLabelStyles: Record<ActionButtonSize, TextStyle> = {
  sm: { fontSize: FontSize.xs },
  md: { fontSize: FontSize.sm },
  lg: { fontSize: FontSize.base },
};
