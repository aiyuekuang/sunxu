import { MaterialCommunityIcons } from '@expo/vector-icons';
import type React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { MIN_TOUCH_TARGET_ANDROID, Spacing, IconSize } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { ScalePressable } from './ScalePressable';

export interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Labelled checkbox row for independent, reversible choices in forms and settings. */
export function CheckboxField({
  label,
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: CheckboxFieldProps) {
  const { colors } = useTheme();

  return (
    <ScalePressable
      testID={testID}
      style={[styles.row, style]}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
    >
      <MaterialCommunityIcons
        name={value ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={IconSize.md}
        color={disabled ? colors.textMuted : value ? colors.primary : colors.textTertiary}
        accessible={false}
      />
      <AppText style={[styles.label, { color: disabled ? colors.textMuted : colors.textSecondary }]}>
        {label}
      </AppText>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
  },
  label: { flexShrink: 1 },
});
