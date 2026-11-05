import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  Switch,
  type TextInputProps,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { AppText as Text } from './AppText';
import { useBottomSheetTextInput } from './BottomSheetContext';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { type FieldHelpContent, FormLabel } from './FormLabel';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  help?: FieldHelpContent;
  containerStyle?: ViewStyle;
  secureToggle?: boolean;
  rightElement?: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  help,
  containerStyle,
  secureToggle,
  secureTextEntry,
  rightElement,
  multiline,
  numberOfLines,
  accessibilityLabel,
  style,
  value,
  onChangeText,
  ...props
}: FormFieldProps) {
  const { colors } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const [showPassword, setShowPassword] = useState(false);
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({ value, onChangeText });
  const isReadOnly = props.editable === false;

  return (
    <View style={[styles.container, containerStyle]}>
      <FormLabel label={label} required={required} help={help} />
      <View
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          {
            borderColor: error ? colors.error : isReadOnly ? colors.border : 'transparent',
            backgroundColor: isReadOnly ? colors.surface : colors.surfaceSecondary,
          },
          isReadOnly && styles.inputWrapperReadonly,
        ]}
      >
        <InputComponent
          key={inputKey}
          style={[
            styles.input,
            style,
            { color: colors.text, fontSize: inputFontSize },
            multiline && styles.inputMultiline,
          ]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : undefined}
          {...inputProps}
          {...props}
          accessibilityLabel={accessibilityLabel ?? label}
        />
        {secureToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {rightElement}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

export function FormSwitch({
  label,
  value,
  onValueChange,
  disabled = false,
  containerStyle,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.switchRow, containerStyle]}>
      <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.textOnPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  inputWrapperReadonly: {
    opacity: 0.72,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 64,
  },
  error: {
    fontSize: FontSize.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    fontSize: FontSize.base,
  },
});
