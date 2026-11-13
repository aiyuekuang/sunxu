import { Platform, Switch } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface SwitchControlProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Required because this control has no visible label of its own. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Standalone native switch for embedding beside a host-owned field label. */
export function SwitchControl({
  value,
  onValueChange,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  testID,
  style,
}: SwitchControlProps) {
  const { colors } = useTheme();
  const targetSize = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;
  const verticalHitSlop = targetSize > MIN_TOUCH_TARGET ? 9 : 8;

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={value ? colors.textOnPrimary : colors.surface}
      ios_backgroundColor={colors.border}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: verticalHitSlop, right: 8, bottom: verticalHitSlop, left: 8 }}
      testID={testID}
      style={[{ opacity: disabled ? 0.55 : 1 }, style]}
    />
  );
}
